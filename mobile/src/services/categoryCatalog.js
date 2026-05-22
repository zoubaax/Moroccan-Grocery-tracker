import { LayoutGrid, Package, Droplets, Home, Box, Cookie, Tag } from 'lucide-react-native';

/** Maps API category names → icon, color, and i18n key (marketplace.cat*). */
export const CATEGORY_META = {
    all: { icon: LayoutGrid, color: '#6366f1', i18nKey: 'marketplace.catAll' },
    essentials: { icon: Package, color: '#0ea5e9', i18nKey: 'marketplace.catEssentials' },
    water_and_beverages: { icon: Droplets, color: '#06b6d4', i18nKey: 'marketplace.catWaterBeverages' },
    cleaning_and_home_care: { icon: Home, color: '#10b981', i18nKey: 'marketplace.catCleaningHome' },
    packaged_food: { icon: Box, color: '#f59e0b', i18nKey: 'marketplace.catPackagedFood' },
    biscuits: { icon: Cookie, color: '#ec4899', i18nKey: 'marketplace.catBiscuits' },
};

export const DEFAULT_CATEGORY_META = { icon: Tag, color: '#8b5cf6', i18nKey: null };

export function normalizeCategoryKey(name) {
    if (!name) return 'unknown';
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

export function resolveCategoryKey(id, name) {
    if (id === 'ALL') return 'all';
    return normalizeCategoryKey(name);
}

export function getCategoryMeta(id, name) {
    const key = resolveCategoryKey(id, name);
    return CATEGORY_META[key] || DEFAULT_CATEGORY_META;
}
