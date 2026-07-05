import Box from '@mui/material/Box';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import AdjustOutlined from '@mui/icons-material/AdjustOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import type { PluginStatusColor, StatusCounts } from '../../types';
import { statusColorMap, STATUS_CARD_DEFS } from '../../theme';
import StatCard from '../common/StatCard';

const ICON_SIZE = 24;

const icons: Record<PluginStatusColor, React.ReactNode> = {
  green: <CheckCircleOutlined sx={{ fontSize: ICON_SIZE }} />,
  red: <CancelOutlined sx={{ fontSize: ICON_SIZE }} />,
  blue: <AdjustOutlined sx={{ fontSize: ICON_SIZE }} />,
  yellow: <WarningAmberOutlined sx={{ fontSize: ICON_SIZE }} />,
  white: <HelpOutlineOutlined sx={{ fontSize: ICON_SIZE }} />,
};

interface PluginStatusCardsProps {
  statusCounts: StatusCounts;
  activeFilter: 'all' | PluginStatusColor;
  onFilterChange: (key: 'all' | PluginStatusColor) => void;
}

export default function PluginStatusCards({ statusCounts, activeFilter, onFilterChange }: PluginStatusCardsProps) {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        {STATUS_CARD_DEFS.map(({ key, label, desc }) => (
          <StatCard
            key={key}
            value={statusCounts[key]}
            label={label}
            description={desc}
            icon={icons[key]}
            color={statusColorMap[key]}
            active={activeFilter === key}
            onClick={() => onFilterChange(activeFilter === key ? 'all' : key)}
          />
        ))}
      </Box>
    </Box>
  );
}
