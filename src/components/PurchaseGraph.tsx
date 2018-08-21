import * as React from "react";
import { IMonthlyGroup, CategoryKey } from "../types/data";
import { colorScale } from "../util/ColorUtils";
import * as R from "ramda";

import transformCategorizedMonthlySeriesData from "../util/transformCategorizedMonthlySeriesData";

import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Bar,
  Legend
} from "recharts";

interface IProps {
  groups: IMonthlyGroup[];
  height?: number;
  color?: string;
  style?: string;
  yAxisMax?: any;
  showLegend?: boolean;
}

export default function PurchaseGraph({
  groups,
  height = 700,
  color,
  style = "bar",
  yAxisMax = "dataMax + 100",
  showLegend = true
}: IProps) {
  const data = transformCategorizedMonthlySeriesData(groups);

  const categories = R.pipe(
    R.chain(R.prop("items")),
    R.map(R.prop("category_key")),
    R.reject(R.isNil),
    R.uniq
  )(groups) as CategoryKey[];

  const colors = colorScale(categories);
  const defaultColorScale = R.times(R.always(color), categories.length);
  const zipped = R.zip(
    categories,
    color === undefined ? colors : defaultColorScale
  );

  const lines = zipped.map(([categoryKey, hexColor]) => {
    return style === "area" ? (
      <Area
        key={categoryKey}
        dataKey={categoryKey}
        fill={hexColor}
        stroke={hexColor}
        type="monotoneX"
        stackId="this"
      />
    ) : (
      <Bar
        key={categoryKey}
        dataKey={categoryKey}
        fill={hexColor}
        stroke={hexColor}
        stackId="this"
      />
    );
  });

  return (
    <div className="purchase-graph">
      {groups.length > 0 && (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            data={data}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, yAxisMax]} allowDecimals={false} />
            <Tooltip />
            {showLegend && <Legend />}
            {lines}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
