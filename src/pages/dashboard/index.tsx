import KasirTab from "@/components/common/kasir-tab";
import LaporanTab from "@/components/common/laporan-tab";
import PengaturanTab from "@/components/common/pengaturan-tab";
import PengeluaranTab from "@/components/common/pengeluaran-tab";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/firebase";
import type { Settings, Transaction } from "@/interface/types";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  FileText,
  Home,
  Minus,
  Plus,
  Settings as SettingsIcon,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("tahuKocekSettings");
    return saved
      ? JSON.parse(saved)
      : {
          hargaLuring: 10000,
          hargaShopee: 12500,
          hppPerPorsi: 6000,
          tanggalSiklus: 25,
        };
  });

  useEffect(() => {
    localStorage.setItem("tahuKocekSettings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const q = query(collection(db, "transaksi"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, "id">),
      }));
      setTransactions(data);
    });
    return () => unsubscribe();
  }, []);

  const getTodayString = () => new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) =>
    t.date.startsWith(getTodayString()),
  );

  const totalPemasukan = todayTransactions
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPengeluaran = todayTransactions
    .filter((t) => t.type === "OUT")
    .reduce((sum, t) => sum + t.amount, 0);
  const arusKas = totalPemasukan - totalPengeluaran; // Saldo kas riil

  const porsiLaku = todayTransactions
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + (t.qty || 0), 0);
  // Total akumulasi Keuntungan Bersih (Margin) dari semua penjualan hari ini
  const marginBersihHariIni = todayTransactions
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + (t.netProfit || 0), 0);

  return (
    <div className="max-w-md mx-auto rounded-xl bg-slate-100 min-h-screen pb-24 font-sans">
      <header className="bg-blue-600 text-white p-5 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight">Tahu Kocek App</h1>
      </header>

      <Toaster position="top-center" />

      <main className="p-4 space-y-6">
        {activeTab === "dashboard" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Box Arus Kas (Uang Riil) */}
            <Card className="border-blue-100 shadow-md">
              <CardHeader className="pb-2">
                <CardDescription>Arus Kas Hari Ini (Uang Riil)</CardDescription>
                <CardTitle className="text-4xl text-zinc-900">
                  Rp {arusKas.toLocaleString("id-ID")}
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <ShoppingBag size={16} />
                    <span className="text-xs font-bold uppercase">
                      Omset Kotor
                    </span>
                  </div>
                  <p className="text-lg font-bold text-emerald-900">
                    Rp {totalPemasukan.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {porsiLaku} Porsi Terjual
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold uppercase">
                      Laba Bersih
                    </span>
                  </div>
                  <p className="text-lg font-bold text-amber-900">
                    Rp {marginBersihHariIni.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Margin Keuntungan
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                onClick={() => setActiveTab("kasir")}
                size="lg"
                className="h-16 bg-blue-600 hover:bg-blue-700 text-lg shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" /> Jual
              </Button>
              <Button
                onClick={() => setActiveTab("pengeluaran")}
                size="lg"
                variant="outline"
                className="h-16 text-lg border-zinc-300 text-zinc-700 shadow-sm"
              >
                <Minus className="mr-2 h-5 w-5" /> Modal
              </Button>
            </div>
          </div>
        )}
        {activeTab === "kasir" && (
          <KasirTab
            settings={settings}
            onSuccess={() => setActiveTab("dashboard")}
          />
        )}
        {activeTab === "laporan" && <LaporanTab transactions={transactions} />}
        {activeTab === "pengaturan" && (
          <PengaturanTab settings={settings} setSettings={setSettings} />
        )}
        {activeTab === "pengeluaran" && (
          <PengeluaranTab onSuccess={() => setActiveTab("dashboard")} />
        )}
      </main>

      {/* Navigasi Bawah */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t flex justify-around p-2 pb-safe shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] z-50">
        {[
          { id: "dashboard", icon: Home, label: "Beranda" },
          { id: "laporan", icon: FileText, label: "Laporan" },
          { id: "pengaturan", icon: SettingsIcon, label: "Setelan" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 transition-colors rounded-lg ${activeTab === item.id ? "text-blue-600" : "text-zinc-400 hover:bg-zinc-50"}`}
          >
            <item.icon
              size={24}
              className={activeTab === item.id ? "fill-blue-50" : ""}
            />
            <span className="text-[10px] font-bold mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
