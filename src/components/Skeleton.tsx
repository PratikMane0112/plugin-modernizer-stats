/**
 * Skeleton loading components for perceived-performance improvement.
 */

export const SkeletonCard = () => (
    <div className="bg-[#1e2329] p-6 rounded-xl border border-slate-800 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-24 mb-3" />
        <div className="h-8 bg-slate-700 rounded w-16 mb-2" />
        <div className="h-3 bg-slate-800 rounded w-20" />
    </div>
);

export const SkeletonChart = ({ height = 'h-[350px]' }: { height?: string }) => (
    <div className={`bg-[#1e2329] p-6 rounded-xl border border-slate-800 animate-pulse ${height}`}>
        <div className="h-5 bg-slate-700 rounded w-40 mb-4" />
        <div className="h-full bg-slate-800 rounded" />
    </div>
);

export const SkeletonRow = () => (
    <div className="flex items-center gap-4 px-6 py-4 animate-pulse border-b border-slate-800">
        <div className="h-4 bg-slate-700 rounded w-48" />
        <div className="h-4 bg-slate-700 rounded w-16" />
        <div className="h-4 bg-slate-700 rounded w-24" />
        <div className="h-4 bg-slate-700 rounded w-12" />
    </div>
);

export const SkeletonPage = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 10 }: { rows?: number }) => (
    <div className="bg-[#1e2329] rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-[#15171a] animate-pulse">
            <div className="h-5 bg-slate-700 rounded w-48" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
        ))}
    </div>
);

export const SkeletonDetail = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-32" />
        <div className="bg-[#1e2329] p-8 rounded-xl border border-slate-800">
            <div className="h-8 bg-slate-700 rounded w-64 mb-4" />
            <div className="h-4 bg-slate-800 rounded w-96 mb-4" />
            <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 w-20 bg-slate-800 rounded-lg" />
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
        </div>
    </div>
);
