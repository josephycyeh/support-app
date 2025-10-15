
import WidgetKit
import SwiftUI

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []

        // Generate a timeline with entries every minute for better counter accuracy
        let currentDate = Date()
        for minuteOffset in 0 ..< 60 { // 60 entries, one per minute for the next hour
            let entryDate = Calendar.current.date(byAdding: .minute, value: minuteOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }

//    func relevances() async -> WidgetRelevances<ConfigurationAppIntent> {
//        // Generate a list containing the contexts this widget is relevant in.
//    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
}

struct widgetEntryView : View {
    var entry: Provider.Entry
    
    func getSobrietyStartDate() -> Date? {
        let defaults = UserDefaults(suiteName: "group.com.caladanapps.myro")
        let startDateString = defaults?.string(forKey: "startDate")
        
        guard let startDateString = startDateString else { return nil }
        
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: startDateString)
    }
    
    func getSoberTime(for date: Date) -> (years: Int, months: Int, days: Int, hours: Int, minutes: Int) {
        guard let startDate = getSobrietyStartDate() else {
            return (years: 0, months: 0, days: 0, hours: 0, minutes: 0)
        }
        
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: startDate, to: date)
        
        return (
            years: components.year ?? 0,
            months: components.month ?? 0,
            days: components.day ?? 0,
            hours: components.hour ?? 0,
            minutes: components.minute ?? 0
        )
    }
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                let soberTime = getSoberTime(for: entry.date)
                
                // Main display - show the most significant time unit
                VStack(spacing: 6) {
                    if soberTime.years > 0 {
                        HStack(alignment: .lastTextBaseline, spacing: 4) {
                            Text("\(soberTime.years)")
                                .font(.system(size: 32, weight: .bold, design: .rounded))
                                .foregroundColor(.secondary)
                            Text("years")
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                                .opacity(0.7)
                        }
                    } else if soberTime.months > 0 {
                        HStack(alignment: .lastTextBaseline, spacing: 4) {
                            Text("\(soberTime.months)")
                                .font(.system(size: 32, weight: .bold, design: .rounded))
                                .foregroundColor(.secondary)
                            Text("months")
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                                .opacity(0.7)
                        }
                    } else {
                        HStack(alignment: .lastTextBaseline, spacing: 4) {
                            Text("\(soberTime.days)")
                                .font(.system(size: 32, weight: .bold, design: .rounded))
                                .foregroundColor(.secondary)
                            Text("days")
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                                .opacity(0.7)
                        }
                    }
                    
                    // Secondary info - all remaining time units on one line
                    HStack(spacing: 4) {
                        if soberTime.years > 0 {
                            // Show months, days, hours, minutes when we have years
                            if soberTime.months > 0 {
                                Text("\(soberTime.months)m")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.secondary)
                                    .opacity(0.8)
                            }
                            if soberTime.days > 0 {
                                Text("\(soberTime.days)d")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.secondary)
                                    .opacity(0.8)
                            }
                            Text("\(soberTime.hours)h")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                                .opacity(0.8)
                            Text("\(soberTime.minutes)m")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                                .opacity(0.8)
                        } else if soberTime.months > 0 {
                            // Show days, hours, minutes when we have months
                            if soberTime.days > 0 {
                                Text("\(soberTime.days)d")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.secondary)
                                    .opacity(0.8)
                            }
                            Text("\(soberTime.hours)h")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                                .opacity(0.8)
                            Text("\(soberTime.minutes)m")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                                .opacity(0.8)
                        } else {
                            // Show hours and minutes when we have days
                            Text("\(soberTime.hours)h")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                                .opacity(0.8)
                            Text("\(soberTime.minutes)m")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                                .opacity(0.8)
                        }
                    }
                }
                .padding(.top, -8)
                .padding(.bottom, 0)
            }
            
            // Sobi ears at bottom center - bigger size
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Image("Sobi")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 80, height: 60)
                        .offset(y: 30) // Move it down so only ears show above bottom edge
                    Spacer()
                }
            }
        }
    }
}

struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
                .containerBackground(Color(red: 1.0, green: 0.898, blue: 0.761), for: .widget)
        }
        .configurationDisplayName("Sobriety Timer")
        .description("Track your sobriety progress with Sobi.")
        .supportedFamilies([.systemSmall])
    }
}

extension ConfigurationAppIntent {
    fileprivate static var smiley: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "😀"
        return intent
    }
    
    fileprivate static var starEyes: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "🤩"
        return intent
    }
}

#Preview(as: .systemSmall) {
    widget()
} timeline: {
    SimpleEntry(date: .now, configuration: .smiley)
    SimpleEntry(date: .now, configuration: .starEyes)
}
