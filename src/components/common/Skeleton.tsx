import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MuiSkeleton from '@mui/material/Skeleton';
import { colors } from '../../theme';

const cardSx = {
  bgcolor: colors.bg.paper,
  borderRadius: '12px',
  border: `1px solid ${colors.border.default}`,
  p: 2,
} as const;

export function SkeletonStatCards() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 4 }, (_, i) => (
        <Grid key={i} size={{ xs: 6, md: 3 }}>
          <Box sx={{ ...cardSx, height: 120 }}>
            <MuiSkeleton variant="text" width="60%" sx={{ bgcolor: colors.border.hover }} />
            <MuiSkeleton
              variant="rectangular"
              height={40}
              sx={{ mt: 1, borderRadius: 1, bgcolor: colors.border.hover }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export function SkeletonChart() {
  return (
    <Box sx={{ ...cardSx, height: 300 }}>
      <MuiSkeleton variant="text" width="40%" sx={{ bgcolor: colors.border.hover }} />
      <MuiSkeleton variant="rectangular" height={230} sx={{ mt: 1, borderRadius: 1, bgcolor: colors.border.hover }} />
    </Box>
  );
}

export function SkeletonTable() {
  return (
    <Box sx={cardSx}>
      <MuiSkeleton variant="text" width="30%" height={32} sx={{ bgcolor: colors.border.hover }} />
      <Box sx={{ mt: 1 }}>
        <MuiSkeleton variant="rectangular" height={36} sx={{ borderRadius: 1, bgcolor: colors.border.hover }} />
        {Array.from({ length: 8 }, (_, i) => (
          <MuiSkeleton
            key={i}
            variant="rectangular"
            height={44}
            sx={{ mt: 0.5, borderRadius: 1, bgcolor: colors.border.default }}
          />
        ))}
      </Box>
    </Box>
  );
}

export function SkeletonDetail() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ ...cardSx, height: 180 }}>
        <MuiSkeleton variant="text" width="50%" height={32} sx={{ bgcolor: colors.border.hover }} />
        <MuiSkeleton variant="text" width="70%" sx={{ mt: 1, bgcolor: colors.border.hover }} />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <MuiSkeleton
              key={i}
              variant="rectangular"
              width={100}
              height={36}
              sx={{ borderRadius: 1, bgcolor: colors.border.hover }}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ ...cardSx, height: 200 }}>
        <MuiSkeleton variant="text" width="30%" height={28} sx={{ bgcolor: colors.border.hover }} />
        <MuiSkeleton variant="rectangular" height={140} sx={{ mt: 1, borderRadius: 1, bgcolor: colors.border.hover }} />
      </Box>
      <Box sx={{ ...cardSx, height: 200 }}>
        <MuiSkeleton variant="text" width="30%" height={28} sx={{ bgcolor: colors.border.hover }} />
        <MuiSkeleton variant="rectangular" height={140} sx={{ mt: 1, borderRadius: 1, bgcolor: colors.border.hover }} />
      </Box>
    </Box>
  );
}

export function SkeletonTimeline() {
  return (
    <Box sx={{ ...cardSx, height: 300 }}>
      <MuiSkeleton variant="text" width="35%" sx={{ bgcolor: colors.border.hover }} />
      <MuiSkeleton variant="rectangular" height={230} sx={{ mt: 1, borderRadius: 1, bgcolor: colors.border.hover }} />
    </Box>
  );
}

export function SkeletonList() {
  return (
    <Box sx={cardSx}>
      {Array.from({ length: 10 }, (_, i) => (
        <MuiSkeleton
          key={i}
          variant="rectangular"
          height={48}
          sx={{ mt: i === 0 ? 0 : 0.5, borderRadius: 1, bgcolor: colors.border.default }}
        />
      ))}
    </Box>
  );
}
