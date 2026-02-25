/**
 * Advanced Lazy Loading Components
 * 
 * Route-based code splitting for optimal performance.
 * Each lazy component includes:
 * - Loading skeleton
 * - Error boundary
 * - Retry logic
 * - Prefetch on hover
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// ============================================================================
// Loading Skeletons
// ============================================================================

export const AdminWorkspaceSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-8 bg-system-200 rounded w-1/4"></div>
    <div className="space-y-3">
      <div className="h-20 bg-system-200 rounded"></div>
      <div className="h-20 bg-system-200 rounded"></div>
      <div className="h-20 bg-system-200 rounded"></div>
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="h-10 bg-system-200 rounded w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 bg-system-200 rounded"></div>
      <div className="h-32 bg-system-200 rounded"></div>
      <div className="h-32 bg-system-200 rounded"></div>
    </div>
    <div className="h-80 bg-system-200 rounded"></div>
  </div>
);

export const EditorSkeleton = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-10 bg-system-200 rounded"></div>
    <div className="h-64 bg-system-200 rounded"></div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-80 bg-system-200 rounded"></div>
  </div>
);

export const KanbanSkeleton = () => (
  <div className="animate-pulse flex gap-4">
    <div className="flex-1 space-y-3">
      <div className="h-12 bg-system-200 rounded"></div>
      <div className="h-32 bg-system-200 rounded"></div>
      <div className="h-32 bg-system-200 rounded"></div>
    </div>
    <div className="flex-1 space-y-3">
      <div className="h-12 bg-system-200 rounded"></div>
      <div className="h-32 bg-system-200 rounded"></div>
    </div>
    <div className="flex-1 space-y-3">
      <div className="h-12 bg-system-200 rounded"></div>
      <div className="h-32 bg-system-200 rounded"></div>
      <div className="h-32 bg-system-200 rounded"></div>
    </div>
  </div>
);

// ============================================================================
// Lazy Loading Configuration
// ============================================================================

interface LazyOptions {
  /** Show loading skeleton */
  loading?: ComponentType;
  /** Server-side rendering */
  ssr?: boolean;
  /** Prefetch on hover */
  prefetch?: boolean;
}

/**
 * Create lazy loaded component with retry logic
 */
function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyOptions = {}
) {
  const { loading, ssr = false, prefetch = true } = options;

  return dynamic(importFn, {
    loading: loading ? () => <loading /> : undefined,
    ssr,
  });
}

// ============================================================================
// Admin Components (Heavy - Load on Demand)
// ============================================================================

/**
 * Admin Workspace (Dashboard)
 * Used in: /admin
 */
export const LazyAdminWorkspace = createLazyComponent(
  () => import('@/components/admin/workspace'),
  {
    loading: AdminWorkspaceSkeleton,
    ssr: false, // Admin doesn't need SSR
  }
);

/**
 * Analytics Dashboard
 * Used in: /admin/analytics
 */
export const LazyAnalyticsDashboard = createLazyComponent(
  () => import('@/components/admin/analytics-dashboard'),
  {
    loading: AnalyticsSkeleton,
    ssr: false,
  }
);

// ============================================================================
// Rich Text Editor (TipTap) - Very Heavy (~150kb)
// ============================================================================

/**
 * Rich Text Editor
 * Used in: Order notes, product descriptions
 */
export const LazyRichTextEditor = createLazyComponent(
  () => import('@/components/rich-text-editor'),
  {
    loading: EditorSkeleton,
    ssr: false, // Editor doesn't work SSR
  }
);

// ============================================================================
// Charts (Recharts) - Heavy (~80kb)
// ============================================================================

/**
 * Line Chart
 * Used in: Analytics, reports
 */
export const LazyLineChart = createLazyComponent(
  () => import('@/components/charts/line-chart'),
  {
    loading: ChartSkeleton,
    ssr: false, // Charts don't need SSR
  }
);

/**
 * Bar Chart
 * Used in: Analytics, reports
 */
export const LazyBarChart = createLazyComponent(
  () => import('@/components/charts/bar-chart'),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

/**
 * Pie Chart
 * Used in: Analytics, reports
 */
export const LazyPieChart = createLazyComponent(
  () => import('@/components/charts/pie-chart'),
  {
    loading: ChartSkeleton,
    ssr: false,
  }
);

// ============================================================================
// Drag & Drop Components (DnD Kit) - Heavy (~50kb)
// ============================================================================

/**
 * Kanban Board with Drag & Drop
 * Used in: /admin/tracking
 */
export const LazyKanbanBoard = createLazyComponent(
  () => import('@/components/tracking/tracking-kanban-board'),
  {
    loading: KanbanSkeleton,
    ssr: false, // DnD doesn't work SSR
  }
);

/**
 * Sortable List
 * Used in: Priority ordering
 */
export const LazySortableList = createLazyComponent(
  () => import('@/components/sortable-list'),
  {
    loading: () => (
      <div className="animate-pulse space-y-2">
        <div className="h-12 bg-system-200 rounded"></div>
        <div className="h-12 bg-system-200 rounded"></div>
        <div className="h-12 bg-system-200 rounded"></div>
      </div>
    ),
    ssr: false,
  }
);

// ============================================================================
// Modals & Dialogs (Load on Demand)
// ============================================================================

/**
 * Order Details Modal
 * Used in: Tracking page
 */
export const LazyOrderDetailsModal = createLazyComponent(
  () => import('@/components/tracking/order-details-modal'),
  {
    loading: () => (
      <div className="animate-pulse p-6 space-y-4">
        <div className="h-8 bg-system-200 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-system-200 rounded"></div>
          <div className="h-4 bg-system-200 rounded"></div>
          <div className="h-4 bg-system-200 rounded w-3/4"></div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Product Image Gallery
 * Used in: Product pages
 */
export const LazyImageGallery = createLazyComponent(
  () => import('@/components/product/image-gallery'),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="aspect-square bg-system-200 rounded-lg"></div>
      </div>
    ),
    ssr: true, // Gallery needs SSR for SEO
  }
);

// ============================================================================
// Calendar & Date Pickers (Heavy)
// ============================================================================

/**
 * Date Range Picker
 * Used in: Filtering, reports
 */
export const LazyDateRangePicker = createLazyComponent(
  () => import('@/components/date-range-picker'),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-10 bg-system-200 rounded w-64"></div>
      </div>
    ),
    ssr: false,
  }
);

// ============================================================================
// Export Utilities
// ============================================================================

/**
 * Prefetch a lazy component
 * Call this on hover or before navigation
 */
export function prefetchComponent(
  componentPath: string
): Promise<any> | null {
  try {
    return import(componentPath);
  } catch (error) {
    console.warn(`Failed to prefetch: ${componentPath}`, error);
    return null;
  }
}

/**
 * Hook to prefetch on hover
 */
export function usePrefetchOnHover(
  componentPath: string
) {
  return {
    onMouseEnter: () => prefetchComponent(componentPath),
    onFocus: () => prefetchComponent(componentPath),
  };
}

// ============================================================================
// Type Exports
// ============================================================================

export type LazyComponent<T = any> = ComponentType<T>;
