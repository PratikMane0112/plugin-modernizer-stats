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
import MuiLink from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import { FiExternalLink } from 'react-icons/fi';
import { FaCodeBranch } from 'react-icons/fa';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import type { Migration } from '../../types';
import { colors } from '../../theme';
import { formatTimestamp } from '../../util/format';

interface PREntry {
  url: string;
  prNumber: string;
  recipe: string;
  status: string;
  date: string;
}

function extractPRNumber(url: string): string {
  const match = url.match(/\/pull\/(\d+)/);
  return match ? `pull/${match[1]}` : 'PR';
}

const statusColors: Record<string, string> = {
  merged: colors.success.light,
  open: colors.primary.dark,
  closed: colors.error.light,
};

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

interface PRHistoryProps {
  migrations: Migration[];
}

export default function PRHistory({ migrations }: PRHistoryProps) {
  const prs = useMemo(() => {
    const entries: PREntry[] = [];
    for (const m of migrations) {
      if (m.pullRequestUrl) {
        entries.push({
          url: m.pullRequestUrl,
          prNumber: extractPRNumber(m.pullRequestUrl),
          recipe: m.migrationName,
          status: m.pullRequestStatus || 'unknown',
          date: m.timestamp,
        });
      }
    }
    entries.sort((a, b) => b.date.localeCompare(a.date));
    return entries;
  }, [migrations]);

  if (prs.length === 0) return null;

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
          PR History ({prs.length})
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Pull Request</TableCell>
              <TableCell sx={headerCellSx}>Recipe</TableCell>
              <TableCell sx={headerCellSx} align="center">
                Status
              </TableCell>
              <TableCell sx={headerCellSx} align="right">
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prs.map((pr, i) => (
              <TableRow key={`${pr.url}-${i}`} sx={{ '&:hover': { bgcolor: colors.bg.hoverSubtle } }}>
                <TableCell sx={cellSx}>
                  <MuiLink
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: colors.primary.dark,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    <FaCodeBranch size={12} />
                    {pr.prNumber}
                    <FiExternalLink size={12} />
                  </MuiLink>
                </TableCell>
                <TableCell sx={{ ...cellSx, color: colors.text.dark }}>{pr.recipe}</TableCell>
                <TableCell sx={cellSx} align="center">
                  <Chip
                    label={pr.status}
                    size="small"
                    sx={{
                      bgcolor: alpha(statusColors[pr.status] ?? colors.text.muted, 0.15),
                      color: statusColors[pr.status] ?? colors.text.muted,
                      border: `1px solid ${alpha(statusColors[pr.status] ?? colors.text.muted, 0.3)}`,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </TableCell>
                <TableCell sx={cellSx} align="right">
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayOutlined sx={{ fontSize: 13, color: colors.text.muted }} />
                    {formatTimestamp(pr.date)}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
