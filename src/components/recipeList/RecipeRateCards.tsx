import Box from '@mui/material/Box';
import { CheckCircleOutlined, TrendingUp, TrendingDown } from '@mui/icons-material';
import type { RateTier } from '../../util/recipeStatus';
import { RATE_CARD_DEFS } from '../../util/recipeStatus';
import { rateTierColorMap } from '../../theme';
import StatCard from '../common/StatCard';

const ICON_SIZE = 24;

const icons: Record<RateTier, React.ReactNode> = {
  high: <CheckCircleOutlined sx={{ fontSize: ICON_SIZE }} />,
  medium: <TrendingUp sx={{ fontSize: ICON_SIZE }} />,
  low: <TrendingDown sx={{ fontSize: ICON_SIZE }} />,
};

interface RecipeRateCardsProps {
  tierCounts: Record<RateTier, number>;
  activeFilter: 'all' | RateTier;
  onFilterChange: (key: 'all' | RateTier) => void;
}

export default function RecipeRateCards({ tierCounts, activeFilter, onFilterChange }: RecipeRateCardsProps) {
  return (
    <Box
      sx={{
        display: { xs: 'flex', sm: 'grid' },
        gridTemplateColumns: { sm: 'repeat(3, 1fr)' },
        gap: 1,
        overflowX: { xs: 'auto', sm: 'visible' },
        mx: { xs: -2, sm: 0 },
        px: { xs: 2, sm: 0 },
        pb: { xs: 0.5, sm: 0 },
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {RATE_CARD_DEFS.map(({ key, label, desc }) => (
        <Box key={key} sx={{ minWidth: { xs: 140, sm: 'auto' }, flexShrink: 0 }}>
          <StatCard
            value={tierCounts[key]}
            label={label}
            description={desc}
            icon={icons[key]}
            color={rateTierColorMap[key]}
            active={activeFilter === key}
            onClick={() => onFilterChange(activeFilter === key ? 'all' : key)}
          />
        </Box>
      ))}
    </Box>
  );
}
