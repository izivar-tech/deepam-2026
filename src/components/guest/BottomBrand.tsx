"use client";

import { useTranslation } from "@/hooks/use-translation";

export function BottomBrand() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
      <span>{t("brand.poweredBy")}&nbsp;</span>
      <span className="font-bold text-foreground">{t("brand.company")}</span>
    </div>
  );
}
