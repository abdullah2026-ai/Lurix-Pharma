const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { MongoClient } = require(path.resolve(process.cwd(), 'node_modules/mongodb'));

// 1. Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
}

const mongoUri = envVars.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

// Map dosage form to standard base unit
function mapDosageFormToBaseUnit(dosageForm) {
  if (!dosageForm) return "Piece";
  const df = dosageForm.toLowerCase();
  if (df.includes("tablet")) return "Tablet";
  if (df.includes("capsule")) return "Capsule";
  if (df.includes("syrup") || df.includes("suspension") || df.includes("solution") || df.includes("drop") || df.includes("lotion")) return "Bottle";
  if (df.includes("injection") || df.includes("infusion") || df.includes("vial")) return "Vial";
  if (df.includes("ointment") || df.includes("cream") || df.includes("gel")) return "Tube";
  if (df.includes("sachet") || df.includes("powder")) return "Sachet";
  if (df.includes("spray") || df.includes("inhaler")) return "Piece";
  if (df.includes("suppository")) return "Piece";
  return "Piece";
}

// Parse price and unit conversions
function parsePricingAndConversions(line, dosageForm, baseUnit) {
  let unitPrice = 0;
  const conversions = [];

  // Match Unit Price: ৳ X.XX
  const unitMatch = line.match(/Unit Price:\s*৳\s*([\d.]+)/i);
  if (unitMatch) {
    unitPrice = parseFloat(unitMatch[1]);
  } else {
    // Find first ৳ price
    const firstPriceMatch = line.match(/৳\s*([\d.]+)/);
    if (firstPriceMatch) {
      unitPrice = parseFloat(firstPriceMatch[1]);
    }
  }

  // Fallback price if 0 or unlisted
  if (!unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
    unitPrice = baseUnit === "Tablet" || baseUnit === "Capsule" ? 5.00 : 50.00;
  }

  // Parse pack/box/strip size like (30's pack: ৳ 225.00) or (100's pack: ৳ 598.00)
  const packMatch = line.match(/\((\d+)'s\s*(?:pack|strip|box)?:\s*৳\s*([\d.]+)\)/i);
  if (packMatch) {
    const factor = parseInt(packMatch[1], 10);
    const packPrice = parseFloat(packMatch[2]);
    if (factor > 1 && packPrice > 0) {
      const convUnit = factor >= 50 ? "Box" : "Strip";
      conversions.push({
        unitName: convUnit,
        conversionFactor: factor,
        sellingPrice: packPrice,
      });
    }
  }

  return { unitPrice, conversions };
}

// CSV row splitter supporting quoted fields
function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();
  const collection = db.collection("medicines");
  console.log("Connected successfully!");

  // Ensure high-performance indexes
  console.log("Creating database indexes for lightning-fast search...");
  await collection.createIndex({ normalizedName: 1 });
  await collection.createIndex({ name: "text", category: "text", notes: "text" });
  await collection.createIndex({ currentStock: 1 });
  console.log("Indexes ready.");

  const csvPath = path.resolve(process.cwd(), 'scratch_medicine.csv');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let batch = [];
  let totalProcessed = 0;
  let totalUpserted = 0;
  const now = new Date();

  console.log("Processing Bangladeshi medicine dataset...");

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue; // Skip header

    if (!line.trim()) continue;

    const cols = parseCsvLine(line);
    if (cols.length < 8) continue;

    const brandName = cols[1];
    const dosageForm = cols[4];
    const generic = cols[5];
    const strength = cols[6];
    const manufacturer = cols[7];

    if (!brandName) continue;

    const fullName = strength ? `${brandName} ${strength}` : brandName;
    const normalizedName = fullName.toLowerCase().trim();
    const baseUnit = mapDosageFormToBaseUnit(dosageForm);

    const { unitPrice, conversions } = parsePricingAndConversions(line, dosageForm, baseUnit);

    // Standard Bangladesh retail pharmacy markup (cost ~ 88% of selling price)
    const averagePurchaseCost = Math.round(unitPrice * 0.88 * 100) / 100;

    const medicineDoc = {
      name: fullName,
      normalizedName,
      category: dosageForm || "Allopathic",
      notes: `Manufacturer: ${manufacturer || "N/A"} | Generic: ${generic || "N/A"}`,
      baseUnit,
      baseSellingPrice: unitPrice,
      averagePurchaseCost,
      currentStock: 100, // Stocked by default so ready to sell in POS
      lowStockThreshold: 15,
      conversions,
      updatedAt: now,
    };

    batch.push({
      updateOne: {
        filter: { normalizedName },
        update: {
          $set: medicineDoc,
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    });

    if (batch.length >= 1000) {
      const res = await collection.bulkWrite(batch, { ordered: false });
      totalProcessed += batch.length;
      totalUpserted += (res.upsertedCount + res.modifiedCount);
      process.stdout.write(`Processed: ${totalProcessed} medicines...\r`);
      batch = [];
    }
  }

  // Flush remaining batch
  if (batch.length > 0) {
    const res = await collection.bulkWrite(batch, { ordered: false });
    totalProcessed += batch.length;
    totalUpserted += (res.upsertedCount + res.modifiedCount);
    batch = [];
  }

  const finalCount = await collection.countDocuments();
  console.log(`\n\n🎉 COMPLETE!`);
  console.log(`Total rows processed: ${totalProcessed}`);
  console.log(`Total medicines now in database: ${finalCount}`);

  await client.close();
}

main().catch(err => {
  console.error("Import error:", err);
  process.exit(1);
});
