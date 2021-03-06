import {
  FormControl,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  withStyles,
  Typography,
  WithStyles,
  createStyles
} from "@material-ui/core";
import { DateTime } from "luxon";
import * as R from "ramda";
import * as React from "react";
import PurchaseGraph from "../components/PurchaseGraph";
import {
  CategoryName,
  MonthKey,
  IAmazonOrderItem,
  IMonthlyGroup,
  ColorMapping
} from "../types/data";

import { connect } from "react-redux";
import { IAppStore } from "../rootTypes";

const styles = (theme: any) =>
  createStyles({
    root: {
      overflowX: "auto",
      width: "100%"
    },
    formControl: {
      margin: theme.spacing.unit,
      minWidth: 200
    },
    selectEmpty: {
      marginTop: theme.spacing.unit * 2
    }
  });

interface ICategoryPageProps extends WithStyles<typeof styles> {
  items: IAmazonOrderItem[];
  monthlyItems: IMonthlyGroup[];
  numMonthsToShow: number;
  globalColorMapping: ColorMapping;
  classes: any;
  handleNumMonthsToShowChange(evt: any): void;
}

export function CategoryPage({
  items,
  monthlyItems,
  classes,
  numMonthsToShow,
  globalColorMapping,
  handleNumMonthsToShowChange
}: ICategoryPageProps) {
  if (items.length === 0) {
    return <Typography>Please upload an order report first.</Typography>;
  }
  const focusedMonthlyGroups = R.takeLast(numMonthsToShow, monthlyItems);

  const allCategories = R.pipe(
    R.chain(R.prop("items")),
    R.map(R.prop("category")),
    R.reject(R.isNil),
    R.reject(R.isEmpty),
    R.uniq
  )(focusedMonthlyGroups) as CategoryName[];

  const focusedDates = R.takeLast(
    numMonthsToShow,
    R.pipe(
      R.map((item: IMonthlyGroup) => DateTime.fromISO(item.monthKey)),
      R.uniq,
      R.sort(R.ascend(R.identity))
    )(monthlyItems)
  );

  const interpolateEmptyMonthlyGroups = (
    dates: DateTime[],
    existingMonthlyGroups: IMonthlyGroup[]
  ): IMonthlyGroup[] => {
    return dates
      .map(monthDateTime => ({
        monthKey: monthDateTime.toISO(),
        items: []
      }))
      .map(monthly => {
        return (
          R.find(
            R.propEq("monthKey", monthly.monthKey),
            existingMonthlyGroups
          ) || monthly
        );
      });
  };

  const categoryGraphs = allCategories.map(
    (categoryName: CategoryName, i: number) => {
      const groupsWithEmpties = R.pipe(
        interpolateEmptyMonthlyGroups,
        R.map((monthlyGroup: IMonthlyGroup) => {
          const categoryItems = monthlyGroup.items.filter(
            R.propEq("category", categoryName)
          );
          return Object.assign({}, monthlyGroup, { items: categoryItems });
        })
      )(focusedDates, focusedMonthlyGroups);

      return (
        <div key={i}>
          <Typography variant="h2">{categoryName}</Typography>
          <PurchaseGraph
            groups={groupsWithEmpties}
            height={250}
            color={globalColorMapping[categoryName as string]}
            yAxisMax={"dataMax"}
            showLegend={false}
          />
        </div>
      );
    }
  );

  const mostRecentMonthlyGroup = R.sort(
    R.descend(R.prop("monthKey")),
    monthlyItems
  )[0] as IMonthlyGroup;
  const mostRecentMonth = DateTime.fromISO(mostRecentMonthlyGroup.monthKey);

  const menuItems = R.pipe(
    R.map((monthlyGroup: IMonthlyGroup) => monthlyGroup.monthKey),
    R.map((monthKey: MonthKey) => {
      const thisMonth = DateTime.fromISO(monthKey);
      const yearDelta =
        (mostRecentMonth.get("year") - thisMonth.get("year")) * 12;
      const numMonthsSinceNow =
        yearDelta + mostRecentMonth.get("month") - thisMonth.get("month") + 1;
      return (
        <MenuItem value={numMonthsSinceNow} key={monthKey}>
          {thisMonth.toFormat("yyyy LLLL")}
        </MenuItem>
      );
    })
  )(monthlyItems);

  return (
    <div className={classes.root}>
      <Grid item={true} xs={12}>
        <form className={classes.root}>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="month-control">Show Trends Since</InputLabel>
            <Select
              value={numMonthsToShow}
              onChange={handleNumMonthsToShowChange}
              inputProps={{ id: "month-control" }}
            >
              {menuItems}
            </Select>
          </FormControl>
        </form>
      </Grid>
      <Grid item={true} xs={12}>
        {categoryGraphs}
      </Grid>
    </div>
  );
}

function mapStateToProps(state: IAppStore) {
  return {
    globalColorMapping: state.globalColorMapping
  };
}

export default connect(mapStateToProps)(withStyles(styles)(CategoryPage));
