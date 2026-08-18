import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import MuiLink from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import CallMergeOutlined from '@mui/icons-material/CallMergeOutlined';
import { FaCodeBranch } from 'react-icons/fa';
import type { PluginReport } from '../../types';
import { colors } from '../../theme';
import { deriveStatus } from '../../util/pluginStatus';
import { formatTimestamp } from '../../util/format';

const statusLabelMap: Record<string, { label: string; color: string; icon: string }> = {
  green: { label: 'Modernized', color: colors.success.light, icon: '\u2713' },
  blue: { label: 'Partial', color: colors.warning.dark, icon: '\u26A0' },
  yellow: { label: 'Partial', color: colors.warning.dark, icon: '\u26A0' },
  red: { label: 'Failed', color: colors.error.light, icon: '\u2717' },
  white: { label: 'Unknown', color: colors.text.muted, icon: '?' },
};

interface PluginHeaderProps {
  plugin: PluginReport;
}

export default function PluginHeader({ plugin }: PluginHeaderProps) {
  const status = deriveStatus(plugin.migrations);
  const statusInfo = statusLabelMap[status] ?? statusLabelMap['white'];

  const { mergedPRs, version, branch } = useMemo(() => {
    let merged = 0;
    let ver = '';
    let br = '';
    for (const m of plugin.migrations) {
      if (m.pullRequestStatus === 'merged') merged++;
      if (!ver && m.pluginVersion) ver = m.pluginVersion;
      if (!br && m.defaultBranch) br = m.defaultBranch;
    }
    return { mergedPRs: merged, version: ver, branch: br };
  }, [plugin.migrations]);

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        p: { xs: 2, sm: 3 },
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        {/* Left side: name, links, metadata */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: colors.text.dark, fontSize: { xs: '1.5rem', sm: '1.85rem' } }}
            >
              {plugin.pluginName}
            </Typography>
            <Chip
              label={`${statusInfo.icon} ${statusInfo.label}`}
              size="small"
              sx={{
                bgcolor: alpha(statusInfo.color, 0.15),
                color: statusInfo.color,
                border: `1px solid ${alpha(statusInfo.color, 0.3)}`,
                fontWeight: 600,
                fontSize: '0.8rem',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
            {plugin.sourceUrls?.repository && (
              <MuiLink
                href={plugin.sourceUrls.repository}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: colors.primary.light,
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View Repository
                <OpenInNewIcon sx={{ fontSize: 14 }} />
              </MuiLink>
            )}
            {branch && (
              <Chip
                icon={<FaCodeBranch size={12} />}
                label={branch}
                size="small"
                sx={{
                  bgcolor: alpha(colors.text.muted, 0.15),
                  color: colors.text.muted,
                  fontSize: '0.8rem',
                  '& .MuiChip-icon': { color: colors.text.muted },
                }}
              />
            )}
            {version && (
              <Chip
                label={`v${version}`}
                size="small"
                sx={{
                  bgcolor: alpha(colors.primary.dark, 0.15),
                  color: colors.primary.light,
                  border: `1px solid ${alpha(colors.primary.dark, 0.3)}`,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: colors.text.muted,
                fontSize: '0.85rem',
              }}
            >
              <CalendarTodayOutlined sx={{ fontSize: 15 }} />
              <Typography component="span" sx={{ fontSize: '0.85rem', color: colors.text.muted }}>
                Last Updated:{' '}
                <strong style={{ color: colors.text.dark }}>{formatTimestamp(plugin.latestMigration)}</strong>
              </Typography>
            </Box>
            <Box
              data-testid="merged-prs"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: colors.text.muted,
                fontSize: '0.85rem',
              }}
            >
              <CallMergeOutlined sx={{ fontSize: 16 }} />
              <Typography component="span" sx={{ fontSize: '0.85rem', color: colors.text.muted }}>
                Merged PRs: <strong style={{ color: colors.text.dark }}>{mergedPRs}</strong>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right side: stat boxes */}
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Box
            data-testid="stat-migrations"
            sx={{
              bgcolor: alpha(colors.primary.dark, 0.12),
              border: `1px solid ${alpha(colors.primary.dark, 0.3)}`,
              borderRadius: '10px',
              px: 2,
              py: 1,
              textAlign: 'center',
              minWidth: 72,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary.light, lineHeight: 1.2 }}>
              {plugin.totalMigrations}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: colors.primary.light, fontWeight: 500 }}>
              Migrations
            </Typography>
          </Box>
          <Box
            data-testid="stat-success"
            sx={{
              bgcolor: alpha(colors.success.light, 0.12),
              border: `1px solid ${alpha(colors.success.light, 0.3)}`,
              borderRadius: '10px',
              px: 2,
              py: 1,
              textAlign: 'center',
              minWidth: 72,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: colors.success.light, lineHeight: 1.2 }}>
              {plugin.successCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: colors.success.light, fontWeight: 500 }}>Success</Typography>
          </Box>
          <Box
            data-testid="stat-failed"
            sx={{
              bgcolor: alpha(colors.error.light, 0.12),
              border: `1px solid ${alpha(colors.error.light, 0.3)}`,
              borderRadius: '10px',
              px: 2,
              py: 1,
              textAlign: 'center',
              minWidth: 72,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: colors.error.light, lineHeight: 1.2 }}>
              {plugin.failCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: colors.error.light, fontWeight: 500 }}>Failed</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
