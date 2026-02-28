interface KeywordTagsProps {
  matchedKeywords: string[];
  missingKeywords: string[];
}

export default function KeywordTags({
  matchedKeywords,
  missingKeywords,
}: KeywordTagsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Matched
        </p>
        <div className="flex flex-wrap gap-1.5">
          {matchedKeywords.map((kw) => (
            <span
              key={kw}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Missing
        </p>
        <div className="flex flex-wrap gap-1.5">
          {missingKeywords.map((kw) => (
            <span
              key={kw}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
