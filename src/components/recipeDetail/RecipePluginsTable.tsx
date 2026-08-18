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
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
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

function statusConfig(status: string): { label: string; color: string } {
  if (status === 'success') return { label: '\u2713 Success', color: colors.success.light };
  if (status === 'fail') return { label: '\u2717 Failed', color: colors.error.light };
  return { label: '? Unknown', color: colors.text.muted };
}

interface RecipePluginsTableProps {
  recipe: RecipeReport;
}

export default function RecipePluginsTable({ recipe }: RecipePluginsTableProps) {
  const navigate = useNavigate();

  const sorted = useMemo(
    () => [...recipe.plugins].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [recipe.plugins]
  );

  if (sorted.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5 }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark }}>
          Affected Plugins ({sorted.length})
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Plugin</TableCell>
              <TableCell sx={headerCellSx} align="center">
                Status
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((p, i) => {
              const { label, color } = statusConfig(p.status);
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
                  <TableCell sx={{ ...cellSx, color: colors.primary.dark, fontWeight: 500 }}>{p.pluginName}</TableCell>
                  <TableCell sx={cellSx} align="center">
                    <Chip
                      label={label}
                      size="small"
                      sx={{
                        bgcolor: alpha(color, 0.15),
                        color,
                        border: `1px solid ${alpha(color, 0.3)}`,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
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
