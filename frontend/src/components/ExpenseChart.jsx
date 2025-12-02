import React, { useContext, useMemo } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Lottie from "lottie-react";
import ExpenseChartEmpty from "../assets/animations/ExpenseChartEmpty.json";

const CATEGORY_COLORS = {
  Food:   "#090979",
  Travel: "#0B8A40",
  Bills:  "#FD1D1D",
  Others: "#2BA4A6",
};
const FALLBACK_COLORS = ["#6366F1", "#14B8A6", "#F59E0B", "#EF4444"];

const ExpenseChart = ({ expenses: propExpenses }) => {
  const { expenses: contextExpenses } = useContext(ExpenseContext);
  const expenses = propExpenses !== undefined ? propExpenses : contextExpenses;

  const chartData = useMemo(() => {
    const map = new Map();
    for (const exp of expenses) {
      const name = exp.category || "Others";
      const val = Number(exp.amount) || 0;
      map.set(name, (map.get(name) || 0) + val);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [expenses]);

  return (
    <div className="bg-[#FAFBFC] rounded-md p-4">
      <h3 className="text-3xl font-bold text-[#127487] mb-6 text-center">
        📊Expenses by Category
      </h3>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <p className="text-gray-500">No expenses yet. Add some to see the chart!</p>
          <Lottie animationData={ExpenseChartEmpty} loop />
        </div>
      ) : (
        <ResponsiveContainer width="95%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => {
                const color =
                  CATEGORY_COLORS[entry.name] ||
                  FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                return <Cell key={`cell-${entry.name}-${index}`} fill={color} />;
              })}
            </Pie>

            <Tooltip
              formatter={(value) => `$${value}`}
              contentStyle={{
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            />
            <Legend
              verticalAlign="top"
              align="center"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ marginTop: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ExpenseChart;
