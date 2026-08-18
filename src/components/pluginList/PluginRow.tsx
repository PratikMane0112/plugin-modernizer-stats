import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import type { PluginReport } from '../../types';
import { colors } from '../../theme';
import { deriveStatus } from '../../util/pluginStatus';
import StatusBadge from '../common/StatusBadge';
import { formatTimestamp } from '../../util/format';

const JENKINS_PLUGINS_BASE = 'https://plugins.jenkins.io';

interface PluginRowProps {
  plugin: PluginReport;
  style: React.CSSProperties;
}

export default function PluginRow({ plugin, style }: PluginRowProps) {
  const navigate = useNavigate();
  const status = deriveStatus(plugin.migrations);

  return (
    <Box
      role="button"
      tabIndex={0}
      style={style}
      onClick={() => navigate(`/plugins/${encodeURIComponent(plugin.pluginName)}`)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/plugins/${encodeURIComponent(plugin.pluginName)}`);
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: { xs: 1.5, sm: 2 },
        gap: { xs: 1, sm: 2 },
        cursor: 'pointer',
        borderBottom: `1px solid ${colors.border.default}`,
        '&:hover': { bgcolor: colors.bg.hoverSubtle },
        '&:focus-visible': { outline: `2px solid ${colors.primary.dark}`, outlineOffset: -2 },
      }}
    >
      <Typography
        sx={{
          flex: 1,
          color: colors.text.dark,
          fontSize: { xs: '0.8rem', sm: '0.95rem' },
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: { xs: 80, sm: 120 },
        }}
      >
        {plugin.pluginName}
      </Typography>

      <Box sx={{ flexShrink: 0 }}>
        <StatusBadge status={status} size="small" />
      </Box>

      <Typography
        sx={{
          color: colors.success.light,
          fontSize: { xs: '0.8rem', sm: '0.9rem' },
          fontWeight: 600,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          ml: 'auto',
        }}
      >
        {plugin.successCount}
        <Typography component="span" sx={{ color: colors.text.muted, fontWeight: 400 }}>
          /{plugin.totalMigrations}
        </Typography>
      </Typography>

      <Typography
        sx={{
          color: colors.text.muted,
          fontSize: '0.9rem',
          minWidth: 90,
          textAlign: 'right',
          display: { xs: 'none', sm: 'block' },
          flexShrink: 0,
        }}
      >
        {formatTimestamp(plugin.latestMigration)}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <IconButton
          component="a"
          href={`${JENKINS_PLUGINS_BASE}/${plugin.pluginName}/`}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          sx={{ color: colors.primary.light, '&:hover': { color: colors.primary.dark }, p: 0.5 }}
          aria-label={`Jenkins plugin page for ${plugin.pluginName}`}
        >
          <OpenInNewIcon sx={{ fontSize: 16 }} />
        </IconButton>
        {plugin.sourceUrls?.repository && (
          <IconButton
            component="a"
            href={plugin.sourceUrls.repository}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            sx={{ color: colors.text.muted, '&:hover': { color: colors.text.dark }, p: 0.5 }}
            aria-label={`GitHub repository for ${plugin.pluginName}`}
          >
            <FaGithub size={16} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
