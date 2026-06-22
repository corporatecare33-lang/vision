import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Download, Printer } from "lucide-react";

const getStoredOrder = () => {
  try {
    return JSON.parse(localStorage.getItem("vision-last-order"));
  } catch {
    return null;
  }
};

const escapePdfText = (value) =>
  String(value ?? "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const downloadPdf = (order) => {
  const deliveryLabel = order.deliveryArea === "inside" ? "Inside Dhaka" : "Outside Dhaka";
  const formatTk = (value) => `Tk ${Number(value || 0).toLocaleString("en-US")}`;
  const fitText = (value, maxLength) => {
    const text = String(value ?? "");
    return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
  };

  const commands = [];
  const rect = (x, y, width, height, color = "1 1 1") => {
    commands.push("q", `${color} rg`, `${x} ${y} ${width} ${height} re f`, "Q");
  };
  const strokeRect = (x, y, width, height, color = "0.86 0.91 0.96", lineWidth = 1) => {
    commands.push("q", `${lineWidth} w`, `${color} RG`, `${x} ${y} ${width} ${height} re S`, "Q");
  };
  const line = (x1, y1, x2, y2, color = "0.86 0.91 0.96", lineWidth = 1) => {
    commands.push("q", `${lineWidth} w`, `${color} RG`, `${x1} ${y1} m ${x2} ${y2} l S`, "Q");
  };
  const text = (value, x, y, size = 10, font = "F1", color = "0.08 0.13 0.21") => {
    commands.push(
      "BT",
      `${color} rg`,
      `/${font} ${size} Tf`,
      `${x} ${y} Td`,
      `(${escapePdfText(value)}) Tj`,
      "ET"
    );
  };

  rect(0, 0, 612, 792, "1 1 1");
  rect(0, 690, 612, 102, "0.04 0.20 0.45");
  rect(0, 680, 612, 10, "0.16 0.78 0.81");
  text("VISION", 42, 743, 28, "F2", "1 1 1");
  text("APPLIANCES", 44, 724, 10, "F2", "0.70 0.93 0.95");
  text("Invoice", 465, 748, 28, "F2", "1 1 1");
  text(order.id, 466, 728, 10, "F1", "0.84 0.94 0.98");
  text(new Date(order.createdAt).toLocaleString(), 466, 712, 10, "F1", "0.84 0.94 0.98");

  rect(42, 560, 252, 88, "0.96 0.99 1");
  strokeRect(42, 560, 252, 88);
  text("Billed To", 60, 622, 12, "F2", "0.04 0.20 0.45");
  text(fitText(order.customer.name, 32), 60, 602, 10, "F2");
  text(`Phone: ${fitText(order.customer.phone, 24)}`, 60, 586, 9);
  text(`Address: ${fitText(order.customer.address, 35)}`, 60, 570, 9);

  rect(318, 560, 252, 88, "0.98 0.99 1");
  strokeRect(318, 560, 252, 88);
  text("Order Details", 336, 622, 12, "F2", "0.04 0.20 0.45");
  text(`Payment: ${fitText(order.paymentMethod, 26)}`, 336, 602, 9);
  text(`Delivery: ${deliveryLabel}`, 336, 586, 9);
  text(`Items: ${order.itemCount}`, 336, 570, 9);

  rect(42, 512, 528, 30, "0.04 0.20 0.45");
  text("Product", 60, 523, 10, "F2", "1 1 1");
  text("Option", 310, 523, 10, "F2", "1 1 1");
  text("Qty", 412, 523, 10, "F2", "1 1 1");
  text("Total", 488, 523, 10, "F2", "1 1 1");

  let rowY = 482;
  order.items.slice(0, 10).forEach((item, index) => {
    if (index % 2 === 0) rect(42, rowY - 9, 528, 30, "0.98 0.99 1");
    line(42, rowY - 10, 570, rowY - 10);
    text(fitText(item.name, 38), 60, rowY, 9, "F2");
    text(fitText(item.option, 17), 310, rowY, 9);
    text(String(item.quantity), 418, rowY, 9, "F2");
    text(formatTk(item.price * item.quantity), 488, rowY, 9, "F2", "0.04 0.20 0.45");
    rowY -= 30;
  });
  if (order.items.length > 10) {
    text(`+ ${order.items.length - 10} more item(s)`, 60, rowY, 9, "F2", "0.39 0.45 0.55");
  }

  const totalBoxY = Math.max(98, rowY - 104);
  rect(350, totalBoxY, 220, 96, "0.96 0.99 1");
  strokeRect(350, totalBoxY, 220, 96, "0.65 0.88 0.92");
  text("Subtotal", 368, totalBoxY + 68, 10);
  text(formatTk(order.subtotal), 482, totalBoxY + 68, 10, "F2");
  text("Delivery", 368, totalBoxY + 46, 10);
  text(formatTk(order.deliveryFee), 482, totalBoxY + 46, 10, "F2");
  line(368, totalBoxY + 32, 552, totalBoxY + 32, "0.65 0.88 0.92");
  text("Total", 368, totalBoxY + 12, 14, "F2", "0.04 0.20 0.45");
  text(formatTk(order.total), 480, totalBoxY + 12, 14, "F2", "0.04 0.20 0.45");

  text("Thank you for shopping with Vision Appliances.", 42, 72, 10, "F2", "0.04 0.20 0.45");
  text("Please keep this invoice for your order confirmation and delivery reference.", 42, 56, 8, "F1", "0.39 0.45 0.55");

  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${order.id}-invoice.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

const ThankYou = () => {
  const location = useLocation();
  const order = location.state?.order || getStoredOrder();

  if (!order) {
    return (
      <div className="container-custom py-24 text-center">
        <h1 className="mb-4 text-3xl font-black uppercase text-vision-dark">No order found</h1>
        <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="container-custom py-12 lg:py-16">
        <div className="mb-8 rounded-lg border border-cyan-100 bg-white p-8 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-4 h-14 w-14 text-vision-cyan" />
          <p className="section-kicker">Order Confirmed</p>
          <h1 className="mb-3 text-4xl font-black uppercase text-vision-dark">Thank You</h1>
          <p className="text-slate-600">Your order has been received. We will contact you soon to confirm delivery.</p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 bg-vision-dark px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Invoice</h2>
              <p className="text-sm text-cyan-100">{order.id}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 font-bold hover:bg-white/20">
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button type="button" onClick={() => downloadPdf(order)} className="inline-flex items-center gap-2 rounded-md bg-vision-cyan px-4 py-2 font-black text-vision-dark hover:bg-cyan-300">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-black text-vision-dark">Customer Details</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Name:</strong> {order.customer.name}</p>
                <p><strong>Phone:</strong> {order.customer.phone}</p>
                <p><strong>Address:</strong> {order.customer.address}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-black text-vision-dark">Order Details</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Delivery:</strong> {order.deliveryArea === "inside" ? "Inside Dhaka" : "Outside Dhaka"}</p>
                <p><strong>Items:</strong> {order.itemCount}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3">Product</th>
                    <th className="py-3">Option</th>
                    <th className="py-3 text-center">Qty</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={`${item.id}-${item.option}`}>
                      <td className="py-3 font-bold text-slate-950">{item.name}</td>
                      <td className="py-3 text-slate-600">{item.option}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right font-black text-vision-blue">Tk {item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto mt-6 max-w-sm space-y-2 border-t border-slate-200 pt-4">
              <div className="flex justify-between"><span>Subtotal</span><strong>Tk {order.subtotal}</strong></div>
              <div className="flex justify-between"><span>Delivery</span><strong>Tk {order.deliveryFee}</strong></div>
              <div className="flex justify-between text-xl font-black text-vision-dark"><span>Total</span><span>Tk {order.total}</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThankYou;
