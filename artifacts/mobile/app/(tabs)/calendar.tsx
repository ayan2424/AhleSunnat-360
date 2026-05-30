import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { useTranslation } from "@/hooks/useTranslation";
import {
  EVENT_COLORS, EVENT_LABELS, HIJRI_MONTHS_AR, HIJRI_MONTHS_EN,
  type IslamicEvent,
  fromHijri, getEventsForDay, getEventsForMonth, hijriDaysInMonth, toHijri,
} from "@/utils/hijri";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CELL_SIZE = Math.floor((Dimensions.get("window").width - 32) / 7);

function EventBadge({ type }: { type: IslamicEvent["type"] }) {
  const color = EVENT_COLORS[type];
  const label = EVENT_LABELS[type];
  return (
    <View style={[styles.badge, { backgroundColor: color + "22", borderColor: color + "55" }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function EventCard({ event, showDay }: { event: IslamicEvent; showDay?: boolean }) {
  const colors = useColors();
  const color = EVENT_COLORS[event.type];
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      onPress={() => event.description ? setExpanded(v => !v) : null}
      style={[styles.eventCard, { backgroundColor: colors.card, borderColor: color + "55", borderLeftColor: color }]}
    >
      <View style={styles.eventCardTop}>
        {showDay && (
          <View style={[styles.dayBubble, { backgroundColor: color + "22" }]}>
            <Text style={[styles.dayBubbleNum, { color }]}>{event.day}</Text>
          </View>
        )}
        <View style={styles.eventCardMain}>
          <View style={styles.eventCardTitleRow}>
            <Text style={styles.eventEmoji}>{event.emoji}</Text>
            <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
            {event.description && (
              <Feather name={expanded ? "chevron-up" : "chevron-down"} size={13} color={colors.mutedForeground} style={{ marginLeft: "auto" }} />
            )}
          </View>
          <Text style={[styles.eventTitleUr, { color: colors.mutedForeground }]}>{event.titleUr}</Text>
          <EventBadge type={event.type} />
          {expanded && event.description && (
            <Text style={[styles.eventDesc, { color: colors.mutedForeground }]}>{event.description}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function CalendarScreen() {
  const colors = useColors();
  const { topPad, scrollBottom } = useLayout();
  const { t, isRTL } = useTranslation();

  const todayHijri = toHijri();
  const [curYear, setCurYear] = useState(todayHijri.year);
  const [curMonth, setCurMonth] = useState(todayHijri.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(todayHijri.day);

  const isCurrentMonth = curYear === todayHijri.year && curMonth === todayHijri.month;

  const daysInMonth = useMemo(() => hijriDaysInMonth(curYear, curMonth), [curYear, curMonth]);
  const firstWeekday = useMemo(() => fromHijri(curYear, curMonth, 1).getDay(), [curYear, curMonth]);

  const cells = useMemo<(number | null)[]>(() => {
    const blanks: null[] = Array(firstWeekday).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const all = [...blanks, ...days];
    while (all.length % 7 !== 0) all.push(null);
    return all;
  }, [firstWeekday, daysInMonth]);

  const rows = useMemo<(number | null)[][]>(() => {
    const result: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7));
    return result;
  }, [cells]);

  const monthEvents = useMemo(() => getEventsForMonth(curMonth), [curMonth]);

  const displayEvents = useMemo(
    () => selectedDay ? getEventsForDay(curMonth, selectedDay) : monthEvents,
    [selectedDay, curMonth, monthEvents]
  );

  const goPrev = () => {
    if (curMonth === 1) { setCurYear(y => y - 1); setCurMonth(12); }
    else setCurMonth(m => m - 1);
    setSelectedDay(null);
  };
  const goNext = () => {
    if (curMonth === 12) { setCurYear(y => y + 1); setCurMonth(1); }
    else setCurMonth(m => m + 1);
    setSelectedDay(null);
  };
  const goToday = () => {
    setCurYear(todayHijri.year);
    setCurMonth(todayHijri.month);
    setSelectedDay(todayHijri.day);
  };

  const gregStart = fromHijri(curYear, curMonth, 1);
  const gregEnd = fromHijri(curYear, curMonth, daysInMonth);
  const gregRange = `${gregStart.toLocaleDateString("en-US", { month: "short", year: "numeric" })}${
    gregEnd.getFullYear() !== gregStart.getFullYear() || gregEnd.getMonth() !== gregStart.getMonth()
      ? " – " + gregEnd.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : ""
  }`;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: scrollBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.titleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>{t("islamicCalendar")}</Text>
          {!isCurrentMonth && (
            <Pressable onPress={goToday} style={[styles.todayBtn, { borderColor: colors.emerald }]}>
              <Text style={[styles.todayBtnText, { color: colors.emerald }]}>Today</Text>
            </Pressable>
          )}
        </View>

        {/* Month Navigation Card */}
        <View style={[styles.calCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Month Header */}
          <View style={styles.monthHeader}>
            <Pressable
              onPress={isRTL ? goNext : goPrev}
              hitSlop={12}
              style={[styles.navBtn, { backgroundColor: colors.muted }]}
            >
              <Feather name={isRTL ? "chevron-right" : "chevron-left"} size={18} color={colors.foreground} />
            </Pressable>
            <View style={styles.monthTitleBlock}>
              <Text style={[styles.monthAr, { color: colors.foreground }]}>
                {HIJRI_MONTHS_AR[curMonth - 1]}
              </Text>
              <Text style={[styles.monthEn, { color: colors.mutedForeground }]}>
                {HIJRI_MONTHS_EN[curMonth - 1]} {curYear} AH
              </Text>
              <Text style={[styles.gregRange, { color: colors.mutedForeground }]}>{gregRange}</Text>
            </View>
            <Pressable
              onPress={isRTL ? goPrev : goNext}
              hitSlop={12}
              style={[styles.navBtn, { backgroundColor: colors.muted }]}
            >
              <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={18} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Week Day Headers */}
          <View style={[styles.weekRow, { borderBottomColor: colors.border }]}>
            {WEEKDAYS.map((d, i) => (
              <View key={d} style={[styles.weekCell, { width: CELL_SIZE }]}>
                <Text style={[
                  styles.weekLabel,
                  { color: i === 5 ? colors.emerald : colors.mutedForeground }
                ]}>
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {/* Day Grid */}
          {rows.map((row, ri) => (
            <View key={ri} style={styles.dayRow}>
              {row.map((day, ci) => {
                if (!day) return <View key={ci} style={[styles.dayCell, { width: CELL_SIZE }]} />;
                const dayEvents = getEventsForDay(curMonth, day);
                const isToday = isCurrentMonth && day === todayHijri.day;
                const isSelected = day === selectedDay;
                const hasEvent = dayEvents.length > 0;
                const topEvent = dayEvents[0];
                return (
                  <Pressable
                    key={ci}
                    onPress={() => setSelectedDay(isSelected ? null : day)}
                    style={[
                      styles.dayCell,
                      { width: CELL_SIZE, height: CELL_SIZE + 14 },
                      isSelected && { backgroundColor: colors.emerald, borderRadius: 10 },
                      isToday && !isSelected && { borderRadius: 10, borderWidth: 1.5, borderColor: colors.emerald },
                    ]}
                  >
                    <Text style={[
                      styles.dayNum,
                      {
                        color: isSelected ? "#FFF"
                          : isToday ? colors.emerald
                          : hasEvent ? colors.foreground
                          : colors.mutedForeground,
                        fontFamily: (isToday || hasEvent) ? "Inter_700Bold" : "Inter_400Regular",
                      },
                    ]}>
                      {day}
                    </Text>
                    <View style={styles.dotRow}>
                      {dayEvents.slice(0, 3).map((e, ei) => (
                        <View
                          key={ei}
                          style={[
                            styles.dot,
                            { backgroundColor: isSelected ? "rgba(255,255,255,0.7)" : EVENT_COLORS[e.type] },
                          ]}
                        />
                      ))}
                      {topEvent && dayEvents.length > 3 && (
                        <Text style={[styles.moreText, { color: isSelected ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>
                          +{dayEvents.length - 3}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Event type legend */}
          <View style={[styles.legend, { borderTopColor: colors.border }]}>
            {(Object.entries(EVENT_COLORS) as [IslamicEvent["type"], string][]).map(([type, color]) => (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>
                  {EVENT_LABELS[type]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Events Section */}
        <View style={[styles.eventsHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.eventsTitle, { color: colors.foreground }]}>
            {selectedDay
              ? `Events — ${HIJRI_MONTHS_EN[curMonth - 1]} ${selectedDay}`
              : `Events in ${HIJRI_MONTHS_EN[curMonth - 1]}`}
          </Text>
          {selectedDay && (
            <Pressable onPress={() => setSelectedDay(null)}>
              <Text style={[styles.showAllText, { color: colors.emerald }]}>Show all</Text>
            </Pressable>
          )}
        </View>

        {displayEvents.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 28 }}>🌙</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {selectedDay
                ? "No events on this day"
                : "No special events this month"}
            </Text>
          </View>
        ) : (
          displayEvents.map((e, i) => (
            <EventCard key={`${e.month}-${e.day}-${e.title}-${i}`} event={e} showDay={!selectedDay} />
          ))
        )}

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          اللَّهُمَّ بَارِكْ لَنَا فِي رَجَبٍ وَشَعْبَانَ وَبَلِّغْنَا رَمَضَانَ
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  titleRow: { alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  todayBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderWidth: 1.5 },
  todayBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  calCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  monthHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 14, gap: 8 },
  navBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  monthTitleBlock: { flex: 1, alignItems: "center", gap: 2 },
  monthAr: { fontSize: 20, fontFamily: "Inter_700Bold" },
  monthEn: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  gregRange: { fontSize: 10, fontFamily: "Inter_400Regular" },

  weekRow: { flexDirection: "row", borderBottomWidth: 1, paddingBottom: 6, paddingTop: 2 },
  weekCell: { alignItems: "center" },
  weekLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  dayRow: { flexDirection: "row" },
  dayCell: { alignItems: "center", justifyContent: "center", gap: 2 },
  dayNum: { fontSize: 13, textAlign: "center" },
  dotRow: { flexDirection: "row", gap: 2, alignItems: "center", minHeight: 6 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  moreText: { fontSize: 7, fontFamily: "Inter_700Bold" },

  legend: { borderTopWidth: 1, paddingTop: 10, paddingBottom: 8, paddingHorizontal: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendLabel: { fontSize: 9, fontFamily: "Inter_400Regular" },

  eventsHeader: { alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  eventsTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  showAllText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  eventCard: {
    borderRadius: 14, borderWidth: 1, borderLeftWidth: 4,
    padding: 12, marginBottom: 9,
  },
  eventCardTop: { flexDirection: "row", gap: 10 },
  dayBubble: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dayBubbleNum: { fontSize: 16, fontFamily: "Inter_700Bold" },
  eventCardMain: { flex: 1, gap: 5 },
  eventCardTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, flexWrap: "wrap" },
  eventEmoji: { fontSize: 15 },
  eventTitle: { fontSize: 13, fontFamily: "Inter_700Bold", flex: 1, lineHeight: 18 },
  eventTitleUr: { fontSize: 13, lineHeight: 22 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 9, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.3 },
  eventDesc: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 17, marginTop: 2 },

  emptyCard: { borderRadius: 14, borderWidth: 1, padding: 28, alignItems: "center", gap: 8, marginBottom: 10 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },

  footer: { fontSize: 14, textAlign: "center", lineHeight: 24, marginTop: 16, marginBottom: 8 },
});
