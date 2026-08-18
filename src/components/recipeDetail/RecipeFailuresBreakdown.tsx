import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { alpha } from '@mui/material/styles';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import type { RecipeReport } from '../../types';
import { colors } from '../../theme';
import { formatTimestamp } from '../../util/format';

const cellSx = {
  color: colors.text.muted,
  fontSize: '0.85rem',
  borderColor: colors.border.default,
  py: 1.5,
} as const;

const headerCellSx = {
  color: colors.text.muted,
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderColor: colors.border.default,
  bgcolor: colors.bg.paper,
} as const;

interface RecipeFailuresBreakdownProps {
  recipe: RecipeReport;
}

export default function RecipeFailuresBreakdown({ recipe }: RecipeFailuresBreakdownProps) {
  const navigate = useNavigate();

  const failed = useMemo(
    () => recipe.plugins.filter((p) => p.status === 'fail').sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [recipe.plugins]
  );

  if (failed.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        borderRadius: '12px',
        border: `1px solid ${alpha(colors.error.light, 0.3)}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberOutlined sx={{ fontSize: 20, color: colors.warning.dark }} />
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark }}>
          Failed Plugins ({failed.length})
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Plugin</TableCell>
              <TableCell sx={headerCellSx} align="right">
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {failed.map((p, i) => {
              const dest = `/plugins/${encodeURIComponent(p.pluginName)}`;
              return (
                <TableRow
                  key={`${p.pluginName}-${i}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(dest)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(dest);
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: colors.bg.hoverSubtle },
                    '&:focus-visible': { outline: `2px solid ${colors.primary.dark}`, outlineOffset: -2 },
                  }}
                >
                  <TableCell sx={{ ...cellSx, color: colors.error.light, fontWeight: 500 }}>{p.pluginName}</TableCell>
                  <TableCell sx={{ ...cellSx, fontFamily: 'monospace' }} align="right">
                    {formatTimestamp(p.timestamp)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
