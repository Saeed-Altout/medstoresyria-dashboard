"use client";

import { useTranslations } from "next-intl";
import { useParams } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "@/lib/api/products.api";
import { formatPrice } from "@/lib/utils/format";

export default function ProductDetailPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductBySlug(id),
  });

  if (isLoading) return <p className="text-muted-foreground">{tCommon("loading")}</p>;
  if (!product) return <p className="text-muted-foreground">{tCommon("no_data")}</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <div className="rounded-lg border p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("price")}</p>
          <p className="font-semibold">{formatPrice(product.price_usd)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("stock")}</p>
          <p className="font-semibold">{product.stock_qty}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("condition")}</p>
          <p className="font-semibold">{t(product.condition === "new" ? "condition_new" : "condition_used")}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("category")}</p>
          <p className="font-semibold">{product.category?.name ?? "—"}</p>
        </div>
      </div>
      {product.images.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {product.images.map((img) => (
            <img key={img.id} src={img.url} alt="" className="w-24 h-24 object-cover rounded-lg border" />
          ))}
        </div>
      )}
    </div>
  );
}
