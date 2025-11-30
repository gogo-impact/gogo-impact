import { Router } from 'express';
import { findFinancialBySlug, upsertFinancialBySlug } from "../services/financialService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/impact/financial", async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    console.log("[financial] GET", { slug });
    const financial = await findFinancialBySlug(slug);

    if (!financial) {
      console.warn("[financial] GET not found", { slug });
      return res.status(404).json({ error: "Financial content not found" });
    }

    const { _id, slug: storedSlug, ...data } = financial;
    console.log("[financial] GET success", {
      slug,
      fields: Object.keys(data || {}),
    });
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

router.put("/impact/financial", requireAuth, async (req, res, next) => {
  try {
    const slug = (req.query.slug as string) ?? "impact-report";
    const data = (req.body ?? {}) as Record<string, unknown>;
    console.log("[financial] PUT request", {
      slug,
      incomingKeys: Object.keys(data || {}),
    });

    const allowedKeys = [
      // Visibility
      "visible",
      "animationsEnabled",
      // Background
      "sectionBgGradient",
      "decorationColor1",
      "decorationColor2",
      "decorationPosition1",
      "decorationPosition2",
      // Header
      "title",
      "titleGradient",
      "subtitle",
      "subtitleColor",
      // KPI Cards
      "kpiCardBgGradient",
      "kpiCardBorderColor",
      "kpiCardBorderRadius",
      "kpiValueColor",
      "kpiLabelColor",
      "kpiNetPositiveColor",
      "kpiNetNegativeColor",
      "kpiRevenueLabel",
      "kpiExpensesLabel",
      "kpiNetLabel",
      "kpiYoyLabel",
      // Line chart
      "lineChartTitle",
      "lineChartTitleColor",
      "lineChartBgColor",
      "lineChartBorderColor",
      "revenueLineColor",
      "expenseLineColor",
      "revenueLineWidth",
      "expenseLineWidth",
      "axisLineColor",
      "axisLabelColor",
      "axisLabelFontSize",
      "tooltipBgColor",
      "tooltipTextColor",
      "tooltipBorderColor",
      "legendRevenueLabel",
      "legendExpensesLabel",
      "legendTextColor",
      // Financial data
      "years",
      "revenueData",
      "expenseData",
      "maxYAxis",
      // Pie charts
      "pieChartBgColor",
      "pieChartBorderColor",
      "pieChartInnerRadius",
      "comesFromTitle",
      "comesFromTitleColor",
      "comesFromData",
      "goesToTitle",
      "goesToTitleColor",
      "goesToData",
      // Breakdown
      "breakdownTitle",
      "breakdownTitleColor",
      "breakdownTextColor",
      "breakdownValueFontWeight",
      // Note
      "showNote",
      "noteText",
      "noteBgColor",
      "noteBorderColor",
      "noteTextColor",
    ];

    const sanitized: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in data) sanitized[key] = (data as any)[key];
    }

    console.log("[financial] PUT sanitized", {
      slug,
      sanitizedKeys: Object.keys(sanitized),
    });

    const saved = await upsertFinancialBySlug(slug, sanitized as any);
    const { _id, slug: storedSlug, ...response } = saved ?? {};
    console.log("[financial] PUT success", {
      slug,
      updatedFields: Object.keys(response || {}),
    });
    return res.json({ data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;


