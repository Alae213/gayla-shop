import { NextRequest, NextResponse } from "next/server";

// Mock Algerian wilayas with realistic delivery costs
const MOCK_DELIVERY_COSTS: Record<
  number,
  { wilayaName: string; domicile: number; stopdesk: number }
> = {
  1: { wilayaName: "Adrar", domicile: 800, stopdesk: 600 },
  2: { wilayaName: "Chlef", domicile: 500, stopdesk: 400 },
  3: { wilayaName: "Laghouat", domicile: 600, stopdesk: 500 },
  4: { wilayaName: "Oum El Bouaghi", domicile: 550, stopdesk: 450 },
  5: { wilayaName: "Batna", domicile: 550, stopdesk: 450 },
  6: { wilayaName: "Béjaïa", domicile: 500, stopdesk: 400 },
  7: { wilayaName: "Biskra", domicile: 600, stopdesk: 500 },
  8: { wilayaName: "Béchar", domicile: 900, stopdesk: 700 },
  9: { wilayaName: "Blida", domicile: 400, stopdesk: 300 },
  10: { wilayaName: "Bouira", domicile: 500, stopdesk: 400 },
  11: { wilayaName: "Tamanrasset", domicile: 1200, stopdesk: 1000 },
  12: { wilayaName: "Tébessa", domicile: 650, stopdesk: 550 },
  13: { wilayaName: "Tlemcen", domicile: 600, stopdesk: 500 },
  14: { wilayaName: "Tiaret", domicile: 550, stopdesk: 450 },
  15: { wilayaName: "Tizi Ouzou", domicile: 500, stopdesk: 400 },
  16: { wilayaName: "Alger", domicile: 350, stopdesk: 250 },
  17: { wilayaName: "Djelfa", domicile: 600, stopdesk: 500 },
  18: { wilayaName: "Jijel", domicile: 550, stopdesk: 450 },
  19: { wilayaName: "Sétif", domicile: 500, stopdesk: 400 },
  20: { wilayaName: "Saïda", domicile: 600, stopdesk: 500 },
  21: { wilayaName: "Skikda", domicile: 550, stopdesk: 450 },
  22: { wilayaName: "Sidi Bel Abbès", domicile: 600, stopdesk: 500 },
  23: { wilayaName: "Annaba", domicile: 600, stopdesk: 500 },
  24: { wilayaName: "Guelma", domicile: 600, stopdesk: 500 },
  25: { wilayaName: "Constantine", domicile: 550, stopdesk: 450 },
  26: { wilayaName: "Médéa", domicile: 500, stopdesk: 400 },
  27: { wilayaName: "Mostaganem", domicile: 550, stopdesk: 450 },
  28: { wilayaName: "M'Sila", domicile: 600, stopdesk: 500 },
  29: { wilayaName: "Mascara", domicile: 600, stopdesk: 500 },
  30: { wilayaName: "Ouargla", domicile: 800, stopdesk: 650 },
  31: { wilayaName: "Oran", domicile: 500, stopdesk: 400 },
  32: { wilayaName: "El Bayadh", domicile: 700, stopdesk: 600 },
  33: { wilayaName: "Illizi", domicile: 1300, stopdesk: 1100 },
  34: { wilayaName: "Bordj Bou Arréridj", domicile: 550, stopdesk: 450 },
  35: { wilayaName: "Boumerdès", domicile: 400, stopdesk: 300 },
  36: { wilayaName: "El Tarf", domicile: 650, stopdesk: 550 },
  37: { wilayaName: "Tindouf", domicile: 1400, stopdesk: 1200 },
  38: { wilayaName: "Tissemsilt", domicile: 600, stopdesk: 500 },
  39: { wilayaName: "El Oued", domicile: 700, stopdesk: 600 },
  40: { wilayaName: "Khenchela", domicile: 600, stopdesk: 500 },
  41: { wilayaName: "Souk Ahras", domicile: 650, stopdesk: 550 },
  42: { wilayaName: "Tipaza", domicile: 400, stopdesk: 300 },
  43: { wilayaName: "Mila", domicile: 600, stopdesk: 500 },
  44: { wilayaName: "Aïn Defla", domicile: 500, stopdesk: 400 },
  45: { wilayaName: "Naâma", domicile: 800, stopdesk: 650 },
  46: { wilayaName: "Aïn Témouchent", domicile: 600, stopdesk: 500 },
  47: { wilayaName: "Ghardaïa", domicile: 700, stopdesk: 600 },
  48: { wilayaName: "Relizane", domicile: 550, stopdesk: 450 },
  49: { wilayaName: "Timimoun", domicile: 900, stopdesk: 750 },
  50: { wilayaName: "Bordj Badji Mokhtar", domicile: 1500, stopdesk: 1300 },
  51: { wilayaName: "Ouled Djellal", domicile: 650, stopdesk: 550 },
  52: { wilayaName: "Béni Abbès", domicile: 1000, stopdesk: 850 },
  53: { wilayaName: "In Salah", domicile: 1100, stopdesk: 950 },
  54: { wilayaName: "In Guezzam", domicile: 1400, stopdesk: 1200 },
  55: { wilayaName: "Touggourt", domicile: 750, stopdesk: 650 },
  56: { wilayaName: "Djanet", domicile: 1400, stopdesk: 1200 },
  57: { wilayaName: "El M'Ghair", domicile: 750, stopdesk: 650 },
  58: { wilayaName: "El Meniaa", domicile: 850, stopdesk: 700 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wilayaId, deliveryType, weight = 1 } = body;

    // Validation
    if (!wilayaId || !deliveryType) {
      return NextResponse.json(
        { error: "Missing required fields: wilayaId, deliveryType" },
        { status: 400 }
      );
    }

    if (wilayaId < 1 || wilayaId > 58) {
      return NextResponse.json({ error: "Invalid wilayaId. Must be between 1-58" }, { status: 400 });
    }

    if (!["Domicile", "Stopdesk"].includes(deliveryType)) {
      return NextResponse.json(
        { error: "Invalid deliveryType. Must be 'Domicile' or 'Stopdesk'" },
        { status: 400 }
      );
    }

    // Simulate API delay (150-300ms)
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 150 + 150));

    // Get mock costs
    const wilayaData = MOCK_DELIVERY_COSTS[wilayaId];
    const baseCost = deliveryType === "Domicile" ? wilayaData.domicile : wilayaData.stopdesk;

    // Add weight adjustment (50 DZD per additional kg)
    const weightAdjustment = weight > 1 ? (weight - 1) * 50 : 0;
    const finalCost = baseCost + weightAdjustment;

    return NextResponse.json({
      success: true,
      cost: finalCost,
      currency: "DZD",
      wilayaName: wilayaData.wilayaName,
      deliveryType,
      weight,
      note: "Mock API - Replace with real ZR Express endpoint in production",
    });
  } catch (error) {
    console.error("Mock ZR Express API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to fetch all wilaya costs
export async function GET() {
  return NextResponse.json({
    success: true,
    wilayas: MOCK_DELIVERY_COSTS,
    note: "Mock data - Replace with real ZR Express API in production",
  });
}
