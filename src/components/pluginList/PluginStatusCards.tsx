import Box from '@mui/material/Box';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import AdjustOutlined from '@mui/icons-material/AdjustOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import type { PluginStatusColor, StatusCounts } from '../../types';
import { statusColorMap, STATUS_CARD_DEFS } from '../../theme';
import StatCard from '../common/StatCard';

const ICON_SIZE = 24;

const icons: Record<string, React.ReactNode> = {
  green: <CheckCircleOutlined sx={{ fontSize: ICON_SIZE }} />,
  red: <CancelOutlined sx={{ fontSize: ICON_SIZE }} />,
  blue: <AdjustOutlined sx={{ fontSize: ICON_SIZE }} />,
  yellow: <WarningAmberOutlined sx={{ fontSize: ICON_SIZE }} />,
};

interface PluginStatusCardsProps {
  statusCounts: StatusCounts;
  activeFilter: 'all' | PluginStatusColor;
  onFilterChange: (key: 'all' | PluginStatusColor) => void;
}

export default function PluginStatusCards({ statusCounts, activeFilter, onFilterChange }: PluginStatusCardsProps) {
  return (
    <Box
      sx={{
        display: { xs: 'flex', sm: 'grid' },
        gridTemplateColumns: { sm: 'repeat(4, 1fr)' },
        gap: 1,
        overflowX: { xs: 'auto', sm: 'visible' },
        mx: { xs: -2, sm: 0 },
        px: { xs: 2, sm: 0 },
        pb: { xs: 0.5, sm: 0 },
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {STATUS_CARD_DEFS.map(({ key, label, desc }) => (
        <Box key={key} sx={{ minWidth: { xs: 140, sm: 'auto' }, flexShrink: 0 }}>
          <StatCard
            value={statusCounts[key]}
            label={label}
            description={desc}
            icon={icons[key]}
            color={statusColorMap[key]}
            active={activeFilter === key}
            onClick={() => onFilterChange(activeFilter === key ? 'all' : key)}
          />
        </Box>
      ))}
    </Box>
  );
}
