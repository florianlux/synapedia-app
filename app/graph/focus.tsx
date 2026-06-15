import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

import {
  buildGraphFocusPath,
  buildWebGraphUrlForNode,
  focusFromGraphNode,
  graphFocusLabel,
  normalizeGraphFocus,
} from '@/features/graph/navigation';
import { isCriticalInteractionEdge } from '@/features/graph/normalize';
import { useGraph } from '@/features/graph/use-graph';
import type { GraphEdge, GraphNode, GraphPayload, GraphRiskLevel } from '@/features/graph/types';
import { useThemeColors } from '@/hooks/use-theme';
import { Radius, Spacing, Typography, getScreenBottomPadding, type ThemeColors } from '@/constants/theme';
import { EmptyState, Pill, PremiumCard } from '@/components/ui/premium';
import { StateCard } from '@/components/ui/StateCard';

type IconName = ComponentProps<typeof Ionicons>['name'];

const DISCLAIMER = 'Graphdaten dienen der Orientierung und ersetzen keine medizinische Beratung.';

function booleanParam(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === '1' || raw === 'true' || raw === 'yes';
}

function riskColor(level: GraphRiskLevel | undefined, colors: ThemeColors): string {
  const map: Record<GraphRiskLevel, string> = {
    low: colors.riskLow,
    moderate: colors.riskModerate,
    high: colors.riskHigh,
    critical: colors.riskExtreme,
    unknown: colors.riskUnknown,
  };
  return map[level ?? 'unknown'];
}

function typeLabel(type: GraphNode['type']): string {
  const labels: Record<GraphNode['type'], string> = {
    substance: 'Substanz',
    receptor: 'Rezeptor',
    effect: 'Effekt',
    mechanism: 'Mechanismus',
    interaction: 'Interaktion',
    article: 'Artikel',
  };
  return labels[type];
}

function relationLabel(edge: GraphEdge | undefined): string {
  if (!edge) return 'Fokus';
  const labels: Record<GraphEdge['type'], string> = {
    similar: 'Aehnlichkeit',
    binds_to: 'Bindet an',
    causes_effect: 'Effekt',
    interaction: 'Interaktion',
    mechanism: 'Mechanismus',
    mentioned_in: 'Erwaehnt in',
  };
  return edge.label ?? labels[edge.type];
}

function connectedEdgeFor(node: GraphNode, focusNode: GraphNode | undefined, edges: GraphEdge[]): GraphEdge | undefined {
  if (!focusNode || node.id === focusNode.id) return undefined;
  return edges.find((edge) => (
    (edge.source === focusNode.id && edge.target === node.id) ||
    (edge.target === focusNode.id && edge.source === node.id)
  )) ?? edges.find((edge) => edge.source === node.id || edge.target === node.id);
}

function displayGraph(payload: GraphPayload, safetyMode: boolean): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  focusNode?: GraphNode;
  safetyEmpty: boolean;
} {
  const focusNode = payload.nodes[0];
  if (!safetyMode) {
    return { nodes: payload.nodes, edges: payload.edges, focusNode, safetyEmpty: false };
  }

  const criticalEdges = payload.edges.filter(isCriticalInteractionEdge);
  if (criticalEdges.length === 0) {
    return { nodes: focusNode ? [focusNode] : [], edges: [], focusNode, safetyEmpty: true };
  }

  const nodeIds = new Set<string>();
  if (focusNode) nodeIds.add(focusNode.id);
  criticalEdges.forEach((edge) => {
    nodeIds.add(edge.source);
    nodeIds.add(edge.target);
  });

  return {
    nodes: payload.nodes.filter((node) => nodeIds.has(node.id)),
    edges: criticalEdges,
    focusNode,
    safetyEmpty: false,
  };
}

export default function GraphFocusScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ focus?: string; safetyMode?: string }>();
  const focus = normalizeGraphFocus(params.focus) ?? 's:mdma';
  const [safetyMode, setSafetyMode] = useState(booleanParam(params.safetyMode));
  const graphState = useGraph(focus, safetyMode);

  useEffect(() => {
    setSafetyMode(booleanParam(params.safetyMode));
  }, [params.safetyMode]);

  const focusTitle = graphFocusLabel(focus);
  const scrollPadding = getScreenBottomPadding(insets.bottom, Spacing.lg);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          { paddingTop: insets.top, backgroundColor: colors.backgroundGlass, borderBottomColor: colors.separator },
        ]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/graph' as Href))} hitSlop={8} style={styles.navButton}>
          <Ionicons name="chevron-back" size={28} color={colors.accent} />
        </Pressable>
        <Text style={[Typography.navTitle, styles.navTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {focusTitle}
        </Text>
        <Pressable
          onPress={() => router.replace('/(tabs)/graph' as Href)}
          hitSlop={8}
          style={styles.navButton}>
          <Ionicons name="git-network-outline" size={23} color={colors.textTertiary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollPadding }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
              {focusTitle}
            </Text>
            <Text style={[Typography.caption, styles.subtitle, { color: colors.textSecondary }]}>
              Native Vorschau fuer Focus-Graph und Deep-Link-Struktur.
            </Text>
          </View>
          <View style={[styles.safetyToggle, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={safetyMode ? colors.riskHigh : colors.textTertiary} />
            <Switch
              value={safetyMode}
              onValueChange={setSafetyMode}
              trackColor={{ false: colors.backgroundTertiary, true: `${colors.riskHigh}88` }}
              thumbColor={safetyMode ? colors.riskHigh : colors.textTertiary}
            />
          </View>
        </View>

        {graphState.status === 'loading' && <GraphSkeleton />}

        {graphState.status === 'error' && (
          <StateCard
            icon="alert-circle-outline"
            title="Graph nicht erreichbar"
            body={graphState.message}
            actionLabel="Erneut versuchen"
            onAction={graphState.retry}
            danger
          />
        )}

        {graphState.status === 'success' && (
          <GraphSuccessContent
            payload={graphState.payload}
            errorMessage={graphState.errorMessage}
            safetyMode={safetyMode}
            onRetry={graphState.retry}
          />
        )}

        <View style={[styles.disclaimer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
            {DISCLAIMER}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function GraphSuccessContent({
  payload,
  errorMessage,
  safetyMode,
  onRetry,
}: {
  payload: GraphPayload;
  errorMessage?: string;
  safetyMode: boolean;
  onRetry: () => void;
}) {
  const colors = useThemeColors();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const visible = useMemo(() => displayGraph(payload, safetyMode), [payload, safetyMode]);
  const selectedRelation = selectedNode
    ? connectedEdgeFor(selectedNode, visible.focusNode, visible.edges)
    : undefined;

  return (
    <View style={styles.successContent}>
      <View style={styles.metaRow}>
        <Pill label={`${payload.nodes.length} Nodes`} tint={colors.accent} icon="ellipse-outline" />
        <Pill label={`${payload.edges.length} Edges`} tint={colors.textSecondary} icon="git-branch-outline" />
        {payload.meta?.source === 'fallback' && (
          <Pill label="Fallback" tint={colors.severityRisky} icon="cloud-offline-outline" />
        )}
      </View>

      {errorMessage && (
        <GraphBanner
          icon="cloud-offline-outline"
          title="Live-Graph nicht erreichbar"
          body={errorMessage}
          actionLabel="Retry"
          onAction={onRetry}
          tint={colors.severityRisky}
        />
      )}

      {payload.meta?.source === 'fallback' && (
        <GraphBanner
          icon="file-tray-stacked-outline"
          title="Lokaler Graph-Fallback"
          body="Diese Vorschau nutzt lokale App-Daten oder einen neutralen Info-Knoten."
          tint={colors.accent}
        />
      )}

      {visible.safetyEmpty ? (
        <EmptyState
          icon="shield-checkmark-outline"
          title="Keine kritischen Verbindungen im aktuellen Ausschnitt gefunden."
          body="Safety Mode zeigt nur High-/Critical-Interaktionen, wenn solche Kanten im aktuellen Ausschnitt vorhanden sind."
        />
      ) : (
        <GraphPreview
          focusNode={visible.focusNode}
          nodes={visible.nodes}
          edges={visible.edges}
          onSelectNode={setSelectedNode}
        />
      )}

      <NodeDetailModal
        node={selectedNode}
        relation={selectedRelation}
        onClose={() => setSelectedNode(null)}
      />
    </View>
  );
}

function GraphSkeleton() {
  const colors = useThemeColors();

  return (
    <View style={[styles.skeletonCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <ActivityIndicator size="small" color={colors.accent} />
      <View style={[styles.skeletonLine, styles.skeletonTitle, { backgroundColor: colors.backgroundTertiary }]} />
      <View style={[styles.skeletonLine, styles.skeletonWide, { backgroundColor: colors.backgroundTertiary }]} />
      <View style={styles.skeletonChips}>
        {[0, 1, 2].map((item) => (
          <View key={item} style={[styles.skeletonChip, { backgroundColor: colors.backgroundTertiary }]} />
        ))}
      </View>
    </View>
  );
}

function GraphBanner({
  icon,
  title,
  body,
  tint,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  body: string;
  tint: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.banner, { backgroundColor: `${tint}10`, borderColor: `${tint}35` }]}>
      <Ionicons name={icon} size={18} color={tint} />
      <View style={styles.bannerCopy}>
        <Text style={[Typography.captionBold, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>{body}</Text>
      </View>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={[styles.bannerAction, { borderColor: `${tint}45` }]}>
          <Text style={[Typography.quickFactLabel, { color: tint }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function GraphPreview({
  focusNode,
  nodes,
  edges,
  onSelectNode,
}: {
  focusNode?: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode) => void;
}) {
  const colors = useThemeColors();
  const center = focusNode ?? nodes[0];
  const neighbors = nodes.filter((node) => node.id !== center?.id);

  if (!center) {
    return (
      <EmptyState
        icon="git-network-outline"
        title="Kein Graph-Ausschnitt"
        body="Fuer diesen Fokus konnte kein lokaler Ausschnitt gebildet werden."
      />
    );
  }

  return (
    <PremiumCard style={styles.previewCard}>
      <View style={styles.previewHeader}>
        <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>Graph Preview</Text>
        <Text style={[Typography.quickFactLabel, { color: colors.textTertiary }]}>native Foundation</Text>
      </View>

      <Pressable
        onPress={() => onSelectNode(center)}
        accessibilityRole="button"
        style={[
          styles.focusCard,
          {
            backgroundColor: `${colors.accent}12`,
            borderColor: `${colors.accent}45`,
          },
        ]}>
        <Text style={[Typography.quickFactLabel, { color: colors.accent }]}>
          {typeLabel(center.type)}
        </Text>
        <Text style={[Typography.bodyBold, styles.focusLabel, { color: colors.textPrimary }]} numberOfLines={2}>
          {center.label}
        </Text>
        <RiskBadge riskLevel={center.riskLevel} />
      </Pressable>

      {edges.length > 0 && (
        <View style={styles.relationRow}>
          {edges.slice(0, 5).map((edge) => (
            <View
              key={edge.id}
              style={[
                styles.relationBadge,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              ]}>
              <Text style={[Typography.quickFactLabel, { color: riskColor(edge.riskLevel, colors) }]} numberOfLines={1}>
                {relationLabel(edge)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.neighborGrid}>
        {neighbors.map((node) => {
          const edge = connectedEdgeFor(node, center, edges);
          const tint = riskColor(node.riskLevel ?? edge?.riskLevel, colors);
          return (
            <Pressable
              key={node.id}
              onPress={() => onSelectNode(node)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.nodeCard,
                {
                  backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
                  borderColor: `${tint}40`,
                },
              ]}>
              <Text style={[Typography.quickFactLabel, { color: tint }]}>{typeLabel(node.type)}</Text>
              <Text style={[Typography.captionBold, styles.nodeLabel, { color: colors.textPrimary }]} numberOfLines={2}>
                {node.label}
              </Text>
              <Text style={[Typography.quickFactLabel, { color: colors.textTertiary }]} numberOfLines={1}>
                {relationLabel(edge)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </PremiumCard>
  );
}

function RiskBadge({ riskLevel }: { riskLevel?: GraphRiskLevel }) {
  const colors = useThemeColors();
  const level = riskLevel ?? 'unknown';
  const labels: Record<GraphRiskLevel, string> = {
    low: 'low',
    moderate: 'moderate',
    high: 'high',
    critical: 'critical',
    unknown: 'unknown',
  };
  const tint = riskColor(level, colors);

  return (
    <View style={[styles.riskBadge, { backgroundColor: `${tint}14`, borderColor: `${tint}35` }]}>
      <Text style={[Typography.quickFactLabel, { color: tint }]}>{labels[level]}</Text>
    </View>
  );
}

function NodeDetailModal({
  node,
  relation,
  onClose,
}: {
  node: GraphNode | null;
  relation?: GraphEdge;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const webUrl = node ? buildWebGraphUrlForNode(node) : undefined;
  const substanceSlug = node?.type === 'substance' ? node.slug : undefined;
  const substanceFocus = node ? focusFromGraphNode(node) : undefined;
  const substanceHref = substanceFocus && substanceSlug
    ? buildGraphFocusPath(substanceFocus)
    : undefined;

  async function openWebGraph() {
    if (!webUrl) return;
    await openBrowserAsync(webUrl, {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  }

  return (
    <Modal visible={!!node} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.background, borderTopColor: colors.cardBorder }]}>
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: colors.textTertiary }]} />
        </View>

        {node && (
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleBlock}>
                <Text style={[Typography.quickFactLabel, { color: colors.accent }]}>
                  {typeLabel(node.type)}
                </Text>
                <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                  {node.label}
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons name="close-circle" size={28} color={colors.textTertiary} />
              </Pressable>
            </View>

            <View style={styles.detailGrid}>
              <DetailTile label="Relation" value={relationLabel(relation)} />
              <DetailTile label="Risk Level" value={node.riskLevel ?? relation?.riskLevel ?? 'unknown'} />
            </View>

            {substanceHref && substanceSlug && (
              <Pressable
                onPress={() => {
                  onClose();
                  router.push({ pathname: '/substance/[slug]', params: { slug: substanceSlug } });
                }}
                style={({ pressed }) => [
                  styles.primaryAction,
                  { backgroundColor: pressed ? '#0066D6' : colors.accent },
                ]}>
                <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>Substanz öffnen</Text>
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
              </Pressable>
            )}

            {webUrl && (
              <Pressable
                onPress={openWebGraph}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  {
                    backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}>
                <Ionicons name="open-outline" size={17} color={colors.accent} />
                <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>Im Webgraph öffnen</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.detailTile, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <Text style={[Typography.quickFactLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[Typography.captionBold, { color: colors.textPrimary }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  navBar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  safetyToggle: {
    minHeight: 38,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  successContent: {
    gap: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  banner: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bannerCopy: {
    flex: 1,
    gap: 2,
  },
  bannerAction: {
    minHeight: 28,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonCard: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  skeletonLine: {
    height: 12,
    borderRadius: Radius.full,
  },
  skeletonTitle: {
    width: '42%',
  },
  skeletonWide: {
    width: '72%',
  },
  skeletonChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  skeletonChip: {
    width: 76,
    height: 28,
    borderRadius: Radius.full,
  },
  previewCard: {
    gap: Spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  focusCard: {
    minHeight: 112,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  focusLabel: {
    textAlign: 'center',
  },
  riskBadge: {
    minHeight: 24,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  relationBadge: {
    minHeight: 26,
    maxWidth: '100%',
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
  },
  neighborGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  nodeCard: {
    width: '48%',
    minHeight: 86,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  nodeLabel: {
    flex: 1,
  },
  disclaimer: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    opacity: 0.45,
  },
  sheetContent: {
    paddingHorizontal: Spacing.page,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  sheetTitleBlock: {
    flex: 1,
    gap: Spacing.xs,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  detailTile: {
    flex: 1,
    minHeight: 62,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  secondaryAction: {
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});
