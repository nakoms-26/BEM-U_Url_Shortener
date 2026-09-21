import { OrderForm } from "@/components/rismed/form/OrderForm";

export default function RismedOrderPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto text-center mb-6 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Formulir Pemesanan Rismed
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Silakan isi formulir di bawah ini untuk mengajukan pesanan desain grafis & publikasi, website & twibbon, bantuan teknis, atau survey.
        </p>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <OrderForm />
      </div>
    </div>
  );
}
