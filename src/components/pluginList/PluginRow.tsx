import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import type { PluginReport } from '../../types';
import { colors } from '../../theme';
import { deriveStatus } from '../../util/pluginStatus';
import StatusBadge from '../common/StatusBadge';

interface PluginRowProps {
  plugin: PluginReport;
  style: React.CSSProperties;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const normalized = dateStr.replace(/T(\d{2})-(\d{2})-(\d{2})$/, 'T$1:$2:$3');
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-CA');
}

export default function PluginRow({ plugin, style }: PluginRowProps) {
  const navigate = useNavigate();
  const status = deriveStatus(plugin.migrations);

  return (
    <Box
      style={style}
      onClick={() => navigate(`/plugins/${plugin.pluginName}`)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: { xs: 1.5, sm: 2 },
        gap: { xs: 1, sm: 2 },
        cursor: 'pointer',
        borderBottom: `1px solid ${colors.border.default}`,
        '&:hover': { bgcolor: colors.bg.hoverSubtle },
      }}
    >
      <Typography
        sx={{
          flex: 1,
          color: colors.text.primary,
          fontSize: { xs: '0.85rem', sm: '0.95rem' },
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {plugin.pluginName}
      </Typography>

      <StatusBadge status={status} size="small" />

      <Typography
        sx={{
          color: colors.success.main,
          fontSize: { xs: '0.8rem', sm: '0.9rem' },
          fontWeight: 600,
          minWidth: { xs: 'auto', sm: 60 },
          flexShrink: 0,
        }}
      >
        {plugin.successCount}
        <Typography component="span" sx={{ color: colors.text.muted, fontWeight: 400 }}>
          /{plugin.totalMigrations}
        </Typography>
      </Typography>

      <Typography
        sx={{
          color: colors.text.secondary,
          fontSize: { xs: '0.8rem', sm: '0.9rem' },
          minWidth: 90,
          textAlign: 'right',
          display: { xs: 'none', sm: 'block' },
          flexShrink: 0,
        }}
      >
        {formatDate(plugin.latestMigration)}
      </Typography>

      <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexShrink: 0 }}>
        {plugin.sourceUrls?.repository ? (
          <IconButton
            component="a"
            href={plugin.sourceUrls.repository}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            sx={{ color: colors.text.secondary, '&:hover': { color: colors.text.primary } }}
            aria-label={`GitHub repository for ${plugin.pluginName}`}
          >
            <FaGithub size={16} />
          </IconButton>
        ) : (
          <Box sx={{ width: 34 }} />
        )}
      </Box>
    </Box>
  );
}
