"use client";

import { ArrowUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

/** One row under a chart (e.g. YouTube / LinkedIn) with one value + optional delta per metric column. */
export type ChartSummaryRow = {
  channel: string;
  values: { value: string; change: string }[];
};

export interface ChartSummaryTableProps {
  /** Column titles after **Channels** (e.g. Impressions, Engagement). */
  metricHeaders: string[];
  rows: ChartSummaryRow[];
}

const rowClass = "hover:bg-transparent";
/** `TableHead` defaults to `font-medium` in `table.v1` — `!font-normal` guarantees regular weight for this embed. */
const labelCell = "min-w-[140px] py-2 text-left text-[13px] !font-normal text-foreground";
const metricHead = "min-w-[140px] py-2 text-right text-[13px] !font-normal text-foreground";
const metricCell = "min-w-[140px] py-2 text-right text-[13px] font-normal";

/**
 * Static channel × metrics summary under an area chart.
 * Uses **`table.v1`** only (no AppDataTable — no column sheet, resize, or persistence).
 */
export function ChartSummaryTable({ metricHeaders, rows }: ChartSummaryTableProps) {
  return (
    <div className="w-full">
      <Table withScrollContainer={false}>
        <TableHeader>
          <TableRow className={rowClass}>
            <TableHead className={labelCell}>Channels</TableHead>
            {metricHeaders.map((h) => (
              <TableHead key={h} className={metricHead}>
                <span className="inline-flex w-full items-center justify-end gap-1">
                  {h}
                  <ChevronDown className="size-3 shrink-0 text-muted-foreground opacity-80" aria-hidden />
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.channel} className={rowClass}>
              <TableCell className={labelCell}>{row.channel}</TableCell>
              {row.values.map((v, vi) => (
                <TableCell key={vi} className={metricCell}>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="text-[13px] font-normal text-foreground">{v.value}</span>
                    {v.change ? (
                      <span className="inline-flex items-center gap-0.5 text-[13px] font-normal text-emerald-600 dark:text-emerald-500">
                        <ArrowUp className="size-3 shrink-0" strokeWidth={1} absoluteStrokeWidth aria-hidden />
                        {v.change}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
