import * as React from "react";
import { IAmazonOrderItem, IMonthlyGroup } from "../types/data";
import Dinero from "dinero.js";
import computeTotalPrice from "../util/computeTotalPrice";

interface IProps {
  items: IAmazonOrderItem[];
  groups: IMonthlyGroup[];
}

export default function PurchaseSummary({ items, groups }: IProps) {
  const numMonths = groups.length;
  const totalPrice = computeTotalPrice({ items });
  const totalPriceFmt = Dinero({
    amount: totalPrice
  }).toFormat();

  const monthlyPrice = numMonths <= 0 ? 0 : Math.floor(totalPrice / numMonths);

  return (
    <div className="purchase-summary">
      <h2>Purchase Overview</h2>
      <ul>
        <li>
          Over the past <strong>{numMonths} months</strong>, you have spent a
          total of <strong>{totalPriceFmt}</strong>.
        </li>
        <li>
          On average, you spend{" "}
          <strong>{Dinero({ amount: monthlyPrice }).toFormat()}</strong> per
          month
        </li>
      </ul>
    </div>
  );
}
