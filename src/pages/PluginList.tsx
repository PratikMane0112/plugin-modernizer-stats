import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import { Search, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useIndex } from '../hooks/useMetadata';
import { ErrorBanner } from '../components/ErrorBanner';

type SortField = 'name';
type SortDir = 'asc' | 'desc';

const inputSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#15171a',
        color: '#e2e8f0',
        borderRadius: '8px',
        '& fieldset': { borderColor: '#334155' },
        '&:hover fieldset': { borderColor: '#475569' },
        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
    },
    '& input::placeholder': { color: '#475569', opacity: 1 },
};

const cardSx = { bgcolor: '#1e2329', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' };

export const PluginList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recipeFilter, setRecipeFilter] = useState('all');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const { index, loading, error } = useIndex();
    const parentRef = useRef<HTMLDivElement>(null);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return <ChevronDown size={14} style={{ color: '#475569' }} />;
        return sortDir === 'asc'
            ? <ChevronUp size={14} style={{ color: '#60a5fa' }} />
            : <ChevronDown size={14} style={{ color: '#60a5fa' }} />;
    };

    const plugins = index?.plugins ?? [];
    const recipes = index?.recipes ?? [];

    const filtered = useMemo(() => {
        const q = searchTerm.toLowerCase();
        const list = plugins.filter(name => name.toLowerCase().includes(q));
        const sorted = [...list].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            return dir * a.localeCompare(b);
        });
        return sorted;
    }, [plugins, searchTerm, sortDir, sortField]);

    const virtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 56,
        overscan: 10,
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <CircularProgress sx={{ color: '#3b82f6' }} size={48} />
            </Box>
        );
    }

    if (error) {
        return <ErrorBanner message={error.message} onRetry={() => window.location.reload()} />;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.875rem', color: '#94a3b8' }}>
                <Box component="span" sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(59,130,246,0.1)', color: '#60a5fa', borderRadius: '9999px', border: '1px solid rgba(59,130,246,0.2)', fontWeight: 500, fontSize: '0.875rem' }}>
                    {plugins.length} plugins
                </Box>
                <Box component="span" sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(168,85,247,0.1)', color: '#c084fc', borderRadius: '9999px', border: '1px solid rgba(168,85,247,0.2)', fontWeight: 500, fontSize: '0.875rem' }}>
                    {recipes.length} recipes
                </Box>
            </Box>

            {/* Search + Filter bar */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, bgcolor: '#1e2329', p: 2, borderRadius: '12px', border: '1px solid #1e293b' }}>
                <TextField
                    placeholder="Search plugins..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    inputProps={{ 'aria-label': 'Search plugins' }}
                    size="small"
                    sx={{ ...inputSx, flex: 1, maxWidth: { sm: 400 } }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} style={{ color: '#64748b' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>{filtered.length} results</Typography>
                    <Select
                        value={recipeFilter}
                        onChange={e => setRecipeFilter(e.target.value)}
                        inputProps={{ 'aria-label': 'Filter by recipe' }}
                        size="small"
                        sx={{
                            bgcolor: '#15171a', color: '#e2e8f0', borderRadius: '8px',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                            '& .MuiSvgIcon-root': { color: '#94a3b8' },
                        }}
                        MenuProps={{ PaperProps: { sx: { bgcolor: '#1e2329', border: '1px solid #334155' } } }}
                    >
                        <MenuItem value="all" sx={{ color: '#e2e8f0' }}>All Recipes</MenuItem>
                        {recipes.map(r => {
                            const shortName = r.split('.').pop() ?? r;
                            return <MenuItem key={r} value={r} sx={{ color: '#e2e8f0' }}>{shortName}</MenuItem>;
                        })}
                    </Select>
                </Box>
            </Box>

            {/* Virtualized Table */}
            <Box sx={cardSx}>
                {/* Table header */}
                <Box sx={{ bgcolor: '#15171a', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{ flex: 1, px: 3, py: 2, cursor: 'pointer', userSelect: 'none', '&:hover': { color: '#e2e8f0' } }}
                            onClick={() => toggleSort('name')}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                Plugin Name {renderSortIcon('name')}
                            </Box>
                        </Box>
                        <Box sx={{ width: 96, px: 3, py: 2, textAlign: 'right' }}>Actions</Box>
                    </Box>
                </Box>

                {/* Virtual scroll container */}
                <div ref={parentRef} style={{ height: '70vh', overflowY: 'auto' }}>
                    <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                        {virtualizer.getVirtualItems().map(virtualRow => {
                            const pluginName = filtered[virtualRow.index];
                            return (
                                <div
                                    key={pluginName}
                                    data-index={virtualRow.index}
                                    ref={virtualizer.measureElement}
                                    style={{ position: 'absolute', top: 0, transform: `translateY(${virtualRow.start}px)`, width: '100%' }}
                                >
                                    <Box
                                        component={Link}
                                        to={`/plugins/${pluginName}`}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            textDecoration: 'none',
                                            borderBottom: '1px solid rgba(30,41,59,0.5)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <Box sx={{ flex: 1, px: 3, py: 2 }}>
                                            <Typography sx={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.9375rem' }}>
                                                {pluginName}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ width: 96, px: 3, py: 2, textAlign: 'right' }}>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#60a5fa', fontWeight: 500, fontSize: '0.875rem' }}>
                                                Details <ChevronRight size={16} />
                                            </Box>
                                        </Box>
                                    </Box>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {filtered.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
                        No plugins found matching your criteria.
                    </Box>
                )}
            </Box>
        </Box>
    );
};
