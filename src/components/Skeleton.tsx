import Box from '@mui/material/Box';
import MuiSkeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';

const cardBg = '#1e2329';
const border = '1px solid #1e293b';
const borderRadius = '12px';

export const SkeletonCard = () => (
    <Box sx={{ bgcolor: cardBg, p: 3, borderRadius, border }}>
        <MuiSkeleton variant="text" width={96} height={20} sx={{ bgcolor: '#334155', mb: 1.5 }} />
        <MuiSkeleton variant="text" width={64} height={32} sx={{ bgcolor: '#334155', mb: 1 }} />
        <MuiSkeleton variant="text" width={80} height={14} sx={{ bgcolor: '#1e293b' }} />
    </Box>
);

export const SkeletonChart = ({ height = 350 }: { height?: number }) => (
    <Box sx={{ bgcolor: cardBg, p: 3, borderRadius, border, height }}>
        <MuiSkeleton variant="text" width={160} height={24} sx={{ bgcolor: '#334155', mb: 2 }} />
        <MuiSkeleton variant="rectangular" height={height - 80} sx={{ bgcolor: '#1e293b', borderRadius: 1 }} />
    </Box>
);

export const SkeletonRow = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, borderBottom: border }}>
        <MuiSkeleton variant="text" width={192} height={18} sx={{ bgcolor: '#334155' }} />
        <MuiSkeleton variant="text" width={64} height={18} sx={{ bgcolor: '#334155' }} />
        <MuiSkeleton variant="text" width={96} height={18} sx={{ bgcolor: '#334155' }} />
        <MuiSkeleton variant="text" width={48} height={18} sx={{ bgcolor: '#334155' }} />
    </Box>
);

export const SkeletonPage = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={i}>
                    <SkeletonCard />
                </Grid>
            ))}
        </Grid>
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}><SkeletonChart /></Grid>
            <Grid size={{ xs: 12, lg: 6 }}><SkeletonChart /></Grid>
        </Grid>
    </Box>
);

export const SkeletonTable = ({ rows = 10 }: { rows?: number }) => (
    <Box sx={{ bgcolor: cardBg, borderRadius, border, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: border, bgcolor: '#15171a' }}>
            <MuiSkeleton variant="text" width={192} height={22} sx={{ bgcolor: '#334155' }} />
        </Box>
        {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
        ))}
    </Box>
);

export const SkeletonDetail = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <MuiSkeleton variant="text" width={128} height={18} sx={{ bgcolor: '#334155' }} />
        <Box sx={{ bgcolor: cardBg, p: 4, borderRadius, border }}>
            <MuiSkeleton variant="text" width={256} height={36} sx={{ bgcolor: '#334155', mb: 2 }} />
            <MuiSkeleton variant="text" width={384} height={18} sx={{ bgcolor: '#1e293b', mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <MuiSkeleton key={i} variant="rectangular" width={80} height={64} sx={{ bgcolor: '#1e293b', borderRadius: 1 }} />
                ))}
            </Box>
        </Box>
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}><SkeletonChart /></Grid>
            <Grid size={{ xs: 12, lg: 6 }}><SkeletonChart /></Grid>
        </Grid>
    </Box>
);
