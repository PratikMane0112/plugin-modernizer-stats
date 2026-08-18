import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Collapse from '@mui/material/Collapse';
import { alpha } from '@mui/material/styles';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlined from '@mui/icons-material/ExpandLessOutlined';
import { useFailedMigrations } from '../../hooks/useMetadata';
import type { PluginReport, Migration } from '../../types';
import { colors } from '../../theme';

const cellSx = {
  color: colors.text.muted,
  fontSize: '0.8rem',
  borderColor: colors.border.default,
  fontFamily: 'monospace',
  py: 1,
} as const;

const headerCellSx = {
  color: colors.text.muted,
  fontWeight: 600,
  fontSize: '0.75rem',
  borderColor: colors.border.default,
  bgcolor: colors.bg.paper,
  fontFamily: 'monospace',
} as const;

interface RawDataSectionProps {
  plugin: PluginReport;
}

export default function RawDataSection({ plugin }: RawDataSectionProps) {
  const [jsonOpen, setJsonOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const { data: csvData } = useFailedMigrations(plugin.pluginName);

  const failed = useMemo(() => plugin.migrations.filter((m) => m.migrationStatus === 'fail'), [plugin.migrations]);

  const jsonPreview = useMemo(() => {
    const data = {
      pluginName: plugin.pluginName,
      pluginRepository: plugin.pluginRepository,
      migrations: plugin.migrations.map((m: Migration) => ({
        pluginVersion: m.pluginVersion,
        jenkinsBaseline: m.jenkinsBaseline ?? '',
        targetBaseline: m.targetBaseline,
        effectiveBaseline: m.effectiveBaseline,
        jenkinsVersion: m.jenkinsVersion,
        migrationName: m.migrationName,
        migrationDescription: m.migrationDescription,
        tags: m.tags,
        migrationId: m.migrationId,
        migrationStatus: m.migrationStatus,
        pullRequestUrl: m.pullRequestUrl,
        pullRequestStatus: m.pullRequestStatus,
      })),
    };
    return JSON.stringify(data, null, 2);
  }, [plugin]);

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([jsonPreview], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plugin.pluginName}-aggregated-migrations.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [jsonPreview, plugin.pluginName]);

  const handleDownloadCsv = useCallback(() => {
    if (!csvData) return;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plugin.pluginName}-failed-migrations.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [csvData, plugin.pluginName]);

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
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark, mb: 1.5 }}>
          Raw Data
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            size="small"
            startIcon={<DescriptionOutlined />}
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            onClick={handleDownloadJson}
            sx={{
              color: colors.text.muted,
              bgcolor: alpha(colors.text.muted, 0.1),
              border: `1px solid ${colors.border.default}`,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: alpha(colors.text.muted, 0.2) },
            }}
          >
            aggregated_migrations.json
          </Button>
          {failed.length > 0 && (
            <Button
              size="small"
              startIcon={<FileDownloadOutlined />}
              endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              onClick={handleDownloadCsv}
              disabled={!csvData}
              sx={{
                color: colors.text.muted,
                bgcolor: alpha(colors.text.muted, 0.1),
                border: `1px solid ${colors.border.default}`,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.8rem',
                '&:hover': { bgcolor: alpha(colors.text.muted, 0.2) },
              }}
            >
              failed_migrations.csv
            </Button>
          )}
        </Box>
      </Box>

      {/* JSON preview */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 1 }}>
        <Button
          size="small"
          onClick={() => setJsonOpen(!jsonOpen)}
          endIcon={jsonOpen ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
          sx={{ color: colors.text.muted, textTransform: 'none', fontSize: '0.8rem', pl: 0 }}
        >
          aggregated_migrations.json
        </Button>
        <Collapse in={jsonOpen}>
          <Box
            sx={{
              bgcolor: alpha(colors.bg.default, 0.6),
              borderRadius: '8px',
              border: `1px solid ${colors.border.default}`,
              p: 2,
              mt: 0.5,
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            <Typography
              component="pre"
              sx={{
                fontSize: '0.75rem',
                color: colors.text.muted,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                m: 0,
              }}
            >
              {jsonPreview}
            </Typography>
          </Box>
        </Collapse>
      </Box>

      {/* CSV preview */}
      {failed.length > 0 && (
        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
          <Button
            size="small"
            onClick={() => setCsvOpen(!csvOpen)}
            endIcon={csvOpen ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
            sx={{ color: colors.text.muted, textTransform: 'none', fontSize: '0.8rem', pl: 0 }}
          >
            failed_migrations.csv ({failed.length} rows)
          </Button>
          <Collapse in={csvOpen}>
            <TableContainer
              sx={{
                bgcolor: alpha(colors.bg.default, 0.6),
                borderRadius: '8px',
                border: `1px solid ${colors.border.default}`,
                mt: 0.5,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>migrationId</TableCell>
                    <TableCell sx={headerCellSx} align="right">
                      migrationStatus
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {failed.map((m, i) => (
                    <TableRow key={`${m.migrationId}-${i}`}>
                      <TableCell sx={cellSx}>{m.migrationId}</TableCell>
                      <TableCell sx={{ ...cellSx, color: colors.error.light }} align="right">
                        {m.migrationStatus}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}
