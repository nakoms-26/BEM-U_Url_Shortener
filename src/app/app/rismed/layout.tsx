import { RismedNav } from "@/components/rismed/RismedNav";
import { RismedTelegramButton } from "@/components/rismed/RismedTelegramButton";

export const metadata = {
  title: "Pemesanan Rismed BEM Unsoed 2026",
  description:
    "Website gacor pokonya dah",
};

export default function RismedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-full px-2 sm:px-4 lg:px-6 py-4 pb-24 max-w-[1600px] mx-auto flex flex-col">
      <RismedNav />
      <div className="flex-1 w-full">{children}</div>
      <RismedTelegramButton />
    </div>
  );
}
