/**
 * Search AI — Recommendations 2.0 (prototype)
 *
 * Design reference: Figma **Recommendations 2.0** — node `86-40295`
 * https://www.figma.com/design/h2UBW91Ecj9rwQHMJfZHE4/Recommendations-2.0?node-id=86-40295
 *
 * Engineering notes (audit placeholder until design signs off pixel-perfect):
 * - Variants: default list, priority filters, per-card impact + actions.
 * - Tokens: semantic Tailwind only on this surface (`bg-card`, `border-border`, …).
 * - Badges / chips: sentence case per product UI rules.
 */
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Lightbulb, Sparkles, TrendingUp, Filter, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";

export type SearchAIRecommendation = {
  id: string;
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  category: string;
  locations: number;
};

const recommendationColumnHelper = createColumnHelper<SearchAIRecommendation>();

const MOCK_RECOMMENDATIONS: SearchAIRecommendation[] = [
  {
    id: "r1",
    title: "Pizza delivery",
    description: "Adding pizza delivery to the service section enhances SEO, improving visibility for relevant local searches for pizza delivery. Potential Reach - 450K",
    impact: "High",
    category: "Services",
    locations: 1,
  },
  {
    id: "r2",
    title: "Close-up shot of freshly baked pizza",
    description: "Upload an image showcasing close-up shot of freshly baked pizza to attract and engage customers effectively.",
    impact: "Low",
    category: "Photos",
    locations: 1,
  },
  {
    id: "r3",
    title: "Delivery person handing pizza to customer",
    description: "Upload an image showcasing delivery person handing pizza to customer to attract and engage customers effectively.",
    impact: "Low",
    category: "Photos",
    locations: 1,
  },
  {
    id: "r4",
    title: "Relax The Back® in Alpharetta...",
    description: "Adding \"pizza delivery\" helps target local searches, even by stating that it is not offered, which clarifies services.",
    impact: "Low",
    category: "Google description",
    locations: 1,
  },
  {
    id: "r5",
    title: "Silver Shop delivers comprehensive...",
    description: "Adding roofing, concrete work, and project planning will help people find Silver Shop's specialized services, boosting SEO ranking.",
    impact: "Low",
    category: "Google description",
    locations: 1,
  },
];

const FILTER_CHIPS = ["All", "High impact", "Medium impact", "Low impact"] as const;

function impactVariant(impact: SearchAIRecommendation["impact"]): "default" | "secondary" | "outline" {
  if (impact === "High") return "default";
  if (impact === "Medium") return "secondary";
  return "outline";
}

export function SearchAIRecommendationsPanel() {
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const columns = useMemo(
    () => [
      recommendationColumnHelper.accessor("title", {
        id: "recommendation",
        header: "Recommendations",
        meta: { settingsLabel: "Recommendations" },
        size: 300,
        enableSorting: true,
        cell: ({ row }) => {
          const rec = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">{rec.category}</span>
              <span className="font-medium text-foreground">{rec.title}</span>
            </div>
          );
        },
      }),
      recommendationColumnHelper.accessor("impact", {
        id: "impact",
        header: "Ranking impact",
        meta: { settingsLabel: "Ranking impact" },
        size: 160,
        enableSorting: true,
        cell: (info) => {
          const impact = info.getValue();
          return (
            <Badge
              variant={impact === "High" ? "destructive" : "secondary"}
              className={
                impact === "High"
                  ? "border-red-100 bg-red-50 text-[length:var(--font-size)] text-red-600 hover:bg-red-50"
                  : "text-[length:var(--font-size)]"
              }
            >
              {impact}
            </Badge>
          );
        },
      }),
      recommendationColumnHelper.accessor("description", {
        id: "description",
        header: "Details",
        meta: { settingsLabel: "Details" },
        size: 360,
        cell: (info) => <p className="leading-relaxed text-foreground">{info.getValue()}</p>,
      }),
      recommendationColumnHelper.accessor("locations", {
        id: "locations",
        header: "Locations",
        meta: { settingsLabel: "Locations" },
        size: 120,
        enableSorting: true,
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      recommendationColumnHelper.display({
        id: "actions",
        header: "",
        meta: { settingsLabel: "Actions" },
        size: 52,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        cell: () => (
          <div className="text-left">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreVertical size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <MainCanvasViewHeader
        title="AI recommendations"
        description="Enhance your business's search ranking with AI-driven recommendations and one-click optimization"
        actions={
          <div className="flex items-center gap-2">
            <AppDataTableColumnSettingsTrigger
              sheetTitle="Recommendation columns"
              onClick={() => setColumnSheetOpen(true)}
            />
            <Button variant="outline" size="icon" className="shrink-0">
              <MoreVertical size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
            </Button>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter size={16} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-8 pt-6">
        <div className="mx-auto flex w-full flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-6 flex flex-col justify-between h-[104px]">
              <span className="text-3xl font-semibold tabular-nums text-foreground">5</span>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-foreground">Pending</span>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between h-[104px]">
              <span className="text-3xl font-semibold tabular-nums text-foreground">1</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth className="text-emerald-500" />
                <span className="text-xs font-medium text-foreground">Accepted</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between h-[104px]">
              <span className="text-3xl font-semibold tabular-nums text-foreground">1</span>
              <div className="flex items-center gap-2">
                <XCircle size={12} strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Rejected</span>
              </div>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden">
            <AppDataTable<SearchAIRecommendation>
              tableId="searchai.recommendations"
              data={MOCK_RECOMMENDATIONS}
              columns={columns}
              initialSorting={[{ id: "recommendation", desc: false }]}
              getRowId={(r) => r.id}
              columnSheetTitle="Recommendation columns"
              className="min-w-0 px-0"
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={setColumnSheetOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
