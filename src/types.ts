export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null;
};

// Enum代わり
export const PRIORITY_OPTIONS = [
  {
    value: 1,
    label: "最重要",
    stars: "★★★",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
  },
  {
    value: 2,
    label: "重要",
    stars: "★★",
    badgeClass: "border-orange-200 bg-orange-50 text-orange-700",
  },
  {
    value: 3,
    label: "普通",
    stars: "★",
    badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
  },
  {
    value: 4,
    label: "低め",
    stars: "☆",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-400",
  },
] as const;