import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { db } from "@/firebase";

interface Props {
  onSuccess: () => void;
}

export default function PengeluaranTab({ onSuccess }: Props) {
  const [tipeKeluar, setTipeKeluar] = useState<"belanja" | "tarik">("belanja");
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const simpanPengeluaran = async () => {
    if (!nominal || !keterangan) {
      toast.error("Isi nominal dan keterangan dulu ya!");
      return;
    }

    try {
      await addDoc(collection(db, "transaksi"), {
        type: "OUT",
        category: tipeKeluar, // Menandai apakah ini belanja modal atau tarik laba
        amount: parseInt(nominal),
        date: new Date().toISOString(),
        desc:
          tipeKeluar === "tarik" ? `[Tarik Laba] ${keterangan}` : keterangan,
      });

      setNominal("");
      setKeterangan("");
      toast.success(
        tipeKeluar === "tarik"
          ? "Berhasil tarik laba!"
          : "Modal belanja dicatat!",
      );
      onSuccess();
    } catch (e) {
      toast.error("Gagal menyimpan: " + e);
    }
  };

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-md">
      <CardHeader>
        <CardTitle>Keluar Kas</CardTitle>
        <CardDescription>
          Catat belanja bahan baku atau penarikan laba bersih.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Jenis Pengeluaran</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={tipeKeluar === "belanja" ? "default" : "outline"}
              className={
                tipeKeluar === "belanja" ? "bg-rose-600 hover:bg-rose-700" : ""
              }
              onClick={() => setTipeKeluar("belanja")}
            >
              Belanja Bahan
            </Button>
            <Button
              variant={tipeKeluar === "tarik" ? "default" : "outline"}
              className={
                tipeKeluar === "tarik"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : ""
              }
              onClick={() => setTipeKeluar("tarik")}
            >
              Tarik Laba
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Nominal (Rp)</Label>
          <Input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            placeholder="Contoh: 50000"
            className="h-12 text-lg"
          />
        </div>

        <div className="space-y-3">
          <Label>Keterangan</Label>
          <Input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder={
              tipeKeluar === "tarik"
                ? "Contoh: Setor ke Kantong Jago"
                : "Contoh: Beli Cabai & Gas"
            }
            className="h-12"
          />
        </div>

        <Button
          onClick={simpanPengeluaran}
          className={`w-full  ${tipeKeluar === "tarik" ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-600 hover:bg-rose-700"}`}
        >
          {tipeKeluar === "tarik"
            ? "Simpan Penarikan Laba"
            : "Simpan Pengeluaran"}
        </Button>
      </CardContent>
    </Card>
  );
}
