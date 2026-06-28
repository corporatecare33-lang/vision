import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();

// ============================================================
// GET credentials from DB
// ============================================================
const getCreds = async () => {
  try {
    const s = await Settings.findOne({ key: "courier-credentials" }).lean();
    return s?.value || {};
  } catch {
    return {};
  }
};

// ============================================================
// PUT /api/courier/credentials  — save DHL + FedEx credentials
// ============================================================
router.put("/credentials", async (req, res) => {
  try {
    await Settings.findOneAndUpdate(
      { key: "courier-credentials" },
      { key: "courier-credentials", value: req.body },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ============================================================
// GET /api/courier/credentials
// ============================================================
router.get("/credentials", async (req, res) => {
  try {
    const creds = await getCreds();
    // Mask secrets before sending
    const masked = { ...creds };
    if (masked.dhlApiSecret) masked.dhlApiSecret = "***";
    if (masked.fedexClientSecret) masked.fedexClientSecret = "***";
    if (masked.fedexOAuthToken) delete masked.fedexOAuthToken;
    res.json(masked);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ============================================================
// POST /api/courier/dhl/shipment  — create DHL Express shipment
// ============================================================
router.post("/dhl/shipment", async (req, res) => {
  try {
    const creds = await getCreds();
    if (!creds.dhlApiKey || !creds.dhlApiSecret || !creds.dhlAccountNumber) {
      return res.status(400).json({ message: "DHL credentials not configured. Go to General Settings → Courier API." });
    }

    const { order, serviceType = "P" } = req.body;
    const today = new Date();
    const plannedDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const isoDate = plannedDate.toISOString().replace(".000Z", "GMT+00:00");

    const body = {
      plannedShippingDateAndTime: isoDate,
      pickup: { isRequested: false },
      productCode: serviceType,
      accounts: [{ typeCode: "shipper", number: creds.dhlAccountNumber }],
      outputImageProperties: { printerDPI: 300, encodingFormat: "pdf", imageOptions: [{ typeCode: "label", templateName: "ECOM26_84_001", isRequested: true }] },
      shipper: {
        address: {
          addressLine1: creds.shipperAddress || "123 Shipper Street",
          cityName: creds.shipperCity || "New York",
          countryCode: creds.shipperCountry || "US",
          postalCode: creds.shipperPostal || "10001",
        },
        contact: {
          personName: creds.shipperName || "Vision Appliances",
          phoneNumber: creds.shipperPhone || "+12125551234",
          emailAddress: creds.shipperEmail || "shipping@vision.com",
          companyName: creds.shipperName || "Vision Appliances",
        },
      },
      receiver: {
        address: {
          addressLine1: order.customer?.address || "Unknown Address",
          cityName: order.deliveryArea || "Unknown",
          countryCode: "US",
          postalCode: order.customer?.postalCode || "00000",
        },
        contact: {
          personName: order.customer?.name || "Customer",
          phoneNumber: (order.customer?.phone || "+10000000000").replace(/\s/g, ""),
          emailAddress: order.customer?.email || "",
        },
      },
      content: {
        packages: [{ weight: 1.5, dimensions: { length: 30, width: 20, height: 10 } }],
        isCustomsDeclarable: false,
        description: (order.items || []).map(i => i.name).join(", ").substring(0, 50) || "Electronics",
        unitOfMeasurement: "metric",
        incoterm: "DAP",
        declaredValueCurrency: "USD",
        declaredValue: order.totalAmount || 0,
      },
    };

    const authToken = Buffer.from(`${creds.dhlApiKey}:${creds.dhlApiSecret}`).toString("base64");
    const baseUrl = creds.dhlSandbox !== false
      ? "https://express.api.dhl.com/mydhlapi/test"
      : "https://express.api.dhl.com/mydhlapi";

    const response = await fetch(`${baseUrl}/shipments`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: data?.detail || data?.title || "DHL API error", raw: data });
    }

    res.json({
      trackingNumber: data.shipmentTrackingNumber,
      trackingUrl: `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${data.shipmentTrackingNumber}`,
      dispatchConfirmation: data.dispatchConfirmationNumber,
      label: data.documents?.[0]?.content || null,
      raw: data,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ============================================================
// POST /api/courier/fedex/shipment  — create FedEx shipment
// ============================================================
const getFedexToken = async (creds) => {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: creds.fedexClientId,
    client_secret: creds.fedexClientSecret,
  });
  const base = creds.fedexSandbox !== false
    ? "https://apis-sandbox.fedex.com"
    : "https://apis.fedex.com";
  const r = await fetch(`${base}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error_description || "FedEx auth failed");
  return { token: d.access_token, base };
};

router.post("/fedex/shipment", async (req, res) => {
  try {
    const creds = await getCreds();
    if (!creds.fedexClientId || !creds.fedexClientSecret || !creds.fedexAccountNumber) {
      return res.status(400).json({ message: "FedEx credentials not configured. Go to General Settings → Courier API." });
    }

    const { order, serviceType = "FEDEX_INTERNATIONAL_PRIORITY" } = req.body;
    const { token, base } = await getFedexToken(creds);

    const body = {
      labelResponseOptions: "URL_ONLY",
      requestedShipment: {
        shipper: {
          contact: { personName: creds.shipperName || "Vision Appliances", phoneNumber: creds.shipperPhone || "2125551234" },
          address: {
            streetLines: [creds.shipperAddress || "123 Shipper Street"],
            city: creds.shipperCity || "New York",
            stateOrProvinceCode: creds.shipperState || "NY",
            postalCode: creds.shipperPostal || "10001",
            countryCode: creds.shipperCountry || "US",
          },
        },
        recipients: [{
          contact: { personName: order.customer?.name || "Customer", phoneNumber: (order.customer?.phone || "0000000000").replace(/\D/g, "").slice(-10) },
          address: {
            streetLines: [order.customer?.address || "Unknown"],
            city: order.deliveryArea || "Unknown",
            stateOrProvinceCode: "NY",
            postalCode: order.customer?.postalCode || "00000",
            countryCode: "US",
          },
        }],
        pickupType: "DROP_OFF_AT_FEDEX_LOCATION",
        serviceType,
        packagingType: "YOUR_PACKAGING",
        shipDatestamp: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        shippingChargesPayment: {
          paymentType: "SENDER",
          payor: { responsibleParty: { accountNumber: { value: creds.fedexAccountNumber } } },
        },
        labelSpecification: { imageType: "PDF", labelStockType: "PAPER_85X11_TOP_HALF_LABEL" },
        requestedPackageLineItems: [{ weight: { units: "LB", value: 2.0 } }],
        customsClearanceDetail: {
          dutiesPayment: { paymentType: "SENDER", payor: { responsibleParty: { accountNumber: { value: creds.fedexAccountNumber } } } },
          commodities: [{
            description: (order.items || []).map(i => i.name).join(", ").substring(0, 50) || "Electronics",
            quantity: order.items?.length || 1,
            quantityUnits: "PCS",
            unitPrice: { amount: order.totalAmount || 0, currency: "USD" },
            customsValue: { amount: order.totalAmount || 0, currency: "USD" },
            weight: { units: "LB", value: 2.0 },
          }],
        },
      },
      accountNumber: { value: creds.fedexAccountNumber },
    };

    const response = await fetch(`${base}/ship/v1/shipments`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", "Accept": "application/json", "x-locale": "en_US" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: data?.errors?.[0]?.message || "FedEx API error", raw: data });
    }

    const shipment = data.output?.transactionShipments?.[0];
    const trackingNumber = shipment?.masterTrackingNumber || shipment?.pieceResponses?.[0]?.trackingNumber;
    const labelUrl = shipment?.pieceResponses?.[0]?.packageDocuments?.[0]?.url;

    res.json({
      trackingNumber,
      trackingUrl: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      labelUrl,
      raw: data,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ============================================================
// GET /api/courier/dhl/track/:trackingNumber
// ============================================================
router.get("/dhl/track/:trackingNumber", async (req, res) => {
  try {
    const creds = await getCreds();
    if (!creds.dhlApiKey || !creds.dhlApiSecret) return res.status(400).json({ message: "DHL credentials not configured" });
    const authToken = Buffer.from(`${creds.dhlApiKey}:${creds.dhlApiSecret}`).toString("base64");
    const base = creds.dhlSandbox !== false ? "https://express.api.dhl.com/mydhlapi/test" : "https://express.api.dhl.com/mydhlapi";
    const r = await fetch(`${base}/tracking?shipmentTrackingNumber=${req.params.trackingNumber}`, {
      headers: { "Authorization": `Basic ${authToken}`, "Accept": "application/json" },
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ============================================================
// GET /api/courier/fedex/track/:trackingNumber
// ============================================================
router.get("/fedex/track/:trackingNumber", async (req, res) => {
  try {
    const creds = await getCreds();
    if (!creds.fedexClientId || !creds.fedexClientSecret) return res.status(400).json({ message: "FedEx credentials not configured" });
    const { token, base } = await getFedexToken(creds);
    const r = await fetch(`${base}/track/v1/trackingnumbers`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ includeDetailedScans: true, trackingInfo: [{ trackingNumberInfo: { trackingNumber: req.params.trackingNumber } }] }),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
