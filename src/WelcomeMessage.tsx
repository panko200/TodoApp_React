type Props = {
  name: string;
  uncompletedCount: number;
  totalCount: number;
  onResetName: () => void;
};

const WelcomeMessage = (props: Props) => {
  const currentTime = new Date();
  const greeting =
    currentTime.getHours() < 12 ? "おはようございます" : "こんにちは";

  const completedCount = props.totalCount - props.uncompletedCount;
  const progress =
    props.totalCount === 0
      ? 0
      : Math.round((completedCount / props.totalCount) * 100);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">
            {greeting}、{props.name}さん。
          </span>
          <button
            type="button"
            onClick={props.onResetName}
            className="cursor-pointer rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            名前変更
          </button>
        </div>
        <div className="text-sm font-medium text-indigo-600">
          未完了：{props.uncompletedCount}件 / 全{props.totalCount}件
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>達成率</span>
          <span className="font-bold text-slate-700">{progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;