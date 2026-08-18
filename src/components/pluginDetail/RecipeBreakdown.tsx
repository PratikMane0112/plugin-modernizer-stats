import { useMemo } from 'react';
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
import type { Migration } from '../../types';
import { colors } from '../../theme';

interface RecipeRow {
  name: string;
  fullId: string;
  applied: number;
  success: number;
  fail: number;
}

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

interface RecipeBreakdownProps {
  migrations: Migration[];
}

export default function RecipeBreakdown({ migrations }: RecipeBreakdownProps) {
  const recipes = useMemo(() => {
    const map = new Map<string, RecipeRow>();
    for (const m of migrations) {
      const id = m.migrationId;
      const existing = map.get(id);
      if (existing) {
        existing.applied++;
        if (m.migrationStatus === 'success') existing.success++;
        else if (m.migrationStatus === 'fail') existing.fail++;
      } else {
        map.set(id, {
          name: m.migrationName,
          fullId: id,
          applied: 1,
          success: m.migrationStatus === 'success' ? 1 : 0,
          fail: m.migrationStatus === 'fail' ? 1 : 0,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.applied - a.applied);
  }, [migrations]);

  if (recipes.length === 0) return null;

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
          Recipe Breakdown ({recipes.length})
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Recipe</TableCell>
              <TableCell sx={headerCellSx} align="center">
                Applied
              </TableCell>
              <TableCell sx={headerCellSx} align="center">
                Success
              </TableCell>
              <TableCell sx={headerCellSx} align="center">
                Failed
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipes.map((r) => {
              const hasUnknown = r.applied > r.success + r.fail;
              const statusLabel = r.fail > 0 ? '\u2717 Failed' : hasUnknown ? '? Unknown' : '\u2713 Modernized';
              const statusColor =
                r.fail > 0 ? colors.error.light : hasUnknown ? colors.text.muted : colors.success.light;
              return (
                <TableRow key={r.fullId} sx={{ '&:hover': { bgcolor: colors.bg.hoverSubtle } }}>
                  <TableCell sx={{ ...cellSx, color: colors.primary.dark, fontWeight: 500 }}>{r.name}</TableCell>
                  <TableCell sx={cellSx} align="center">
                    {r.applied}
                  </TableCell>
                  <TableCell sx={{ ...cellSx, color: colors.success.light, fontWeight: 600 }} align="center">
                    {r.success}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellSx,
                      color: r.fail > 0 ? colors.error.light : colors.text.muted,
                      fontWeight: r.fail > 0 ? 600 : 400,
                    }}
                    align="center"
                  >
                    {r.fail}
                  </TableCell>
                  <TableCell sx={cellSx} align="right">
                    <Chip
                      label={statusLabel}
                      size="small"
                      sx={{
                        bgcolor: alpha(statusColor, 0.15),
                        color: statusColor,
                        border: `1px solid ${alpha(statusColor, 0.3)}`,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
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
