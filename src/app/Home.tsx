import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Idea } from "../../types/DataStoreTypes";
import { AppContext } from "./AppContext";
import SignOut from "./auth/SignOut";
import { useConnections } from "./connections/useConnections";
import { findAllIdeas, findIdeasForConnections } from "./ideas/IdeasService";
import { Avatar, nameFromEmail } from "./shared/Avatar";
import { Button } from "./shared/Buttons";
import { colors, radius, spacing, type } from "./shared/theme";

const MAX_FRIEND_IDEAS = 3;

type FriendIdea = { email: string, idea: Idea };

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home({ route, navigation}: any) {

  const appContext = useContext(AppContext);
  const email = appContext.userInfo?.email;
  const { activeConnections, incomingRequests, isLoading } = useConnections(email);
  const shouldShowInvitePrompt = isLoading || activeConnections.length === 0;

  const [myIdeaCount, setMyIdeaCount] = useState<number | undefined>(undefined);
  const [friendIdeas, setFriendIdeas] = useState<FriendIdea[]>([]);

  useEffect(() => {
    if (!email) {
      return;
    }
    let isCurrent = true;
    findAllIdeas(email)
      .then((ideas) => { if (isCurrent) setMyIdeaCount(ideas.length); })
      .catch((error) => console.error('Home: error getting idea count.', error));
    return () => { isCurrent = false; };
  }, [email]);

  useEffect(() => {
    let isCurrent = true;
    findIdeasForConnections(activeConnections).then((result) => {
      if (!isCurrent) return;
      const flattened = result.flatMap((connection) => connection.ideas.map((idea) => ({ email: connection.email, idea })));
      setFriendIdeas(flattened.slice(0, MAX_FRIEND_IDEAS));
    });
    return () => { isCurrent = false; };
  }, [activeConnections]);

  const listSummary = () => {
    const ideasText = myIdeaCount === undefined ? '' : `${myIdeaCount} ${myIdeaCount === 1 ? 'idea' : 'ideas'}`;
    const friendCount = activeConnections.length;
    const friendsText = friendCount > 0 ? `seen by ${friendCount} ${friendCount === 1 ? 'friend' : 'friends'}` : 'not shared yet';
    return ideasText ? `${ideasText} · ${friendsText}` : friendsText;
  };

  const requestNames = incomingRequests.map((request) => nameFromEmail(request.otherEmail));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={type.subhead}>{greetingForHour(new Date().getHours())}</Text>
            <Text style={type.largeTitle}>Hi, {appContext.userInfo?.firstName}</Text>
          </View>
          <SignOut />
        </View>

        {incomingRequests.length > 0 && (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Connections')}
            style={({ pressed }) => [styles.requestBanner, pressed ? { opacity: 0.85 } : null]}
          >
            <View style={styles.avatarStack}>
              {incomingRequests.slice(0, 2).map((request, index) => (
                <View key={request.otherEmail} style={index > 0 ? { marginLeft: -10 } : null}>
                  <Avatar email={request.otherEmail} size={32} ringColor={colors.secondaryMuted} />
                </View>
              ))}
            </View>
            <View style={styles.flex}>
              <Text style={type.headline}>
                {incomingRequests.length} friend {incomingRequests.length === 1 ? 'request' : 'requests'}
              </Text>
              <Text style={styles.requestDetail} numberOfLines={1}>
                {requestNames.join(' and ')} {incomingRequests.length === 1 ? 'wants' : 'want'} to connect
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.secondary} />
          </Pressable>
        )}

        {shouldShowInvitePrompt && (
          <View style={styles.card}>
            <View style={styles.cardHeading}>
              <View style={[styles.iconTile, { backgroundColor: colors.secondaryMuted }]}>
                <MaterialCommunityIcons name="account-plus-outline" size={26} color={colors.secondary} />
              </View>
              <Text style={[type.subhead, styles.flex]}>To invite someone to your ideas, click below.</Text>
            </View>
            <Button
              testID="add-connection-button"
              label="Add"
              icon="account-plus-outline"
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('Connections')}
            />
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <View style={styles.iconTile}>
              <MaterialCommunityIcons name="gift-outline" size={26} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={type.title3}>Your list</Text>
              <Text style={type.subhead}>{listSummary()}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Button
              label="Add an idea"
              icon="plus"
              size="medium"
              style={styles.flex}
              onPress={() => navigation.navigate('My Ideas', { screen: 'AddIdea' })}
            />
            <Button
              label="View"
              variant="secondary"
              size="medium"
              onPress={() => navigation.navigate('My Ideas', { screen: 'MyIdeas' })}
            />
          </View>
        </View>

        {friendIdeas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={type.title2}>From friends</Text>
              <Pressable accessibilityRole="button" hitSlop={10} onPress={() => navigation.navigate('GiveTab')}>
                <Text style={styles.link}>See all</Text>
              </Pressable>
            </View>
            <View style={styles.list}>
              {friendIdeas.map(({ email: friendEmail, idea }, index) => (
                <View key={`${friendEmail}-${idea.id ?? index}`}>
                  {index > 0 && <View style={styles.divider} />}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigation.navigate('GiveTab')}
                    style={({ pressed }) => [styles.listRow, pressed ? { backgroundColor: colors.bgRaised } : null]}
                  >
                    <Avatar email={friendEmail} size={44} />
                    <View style={styles.flex}>
                      <Text style={type.headline} numberOfLines={1}>{idea.title}</Text>
                      <Text style={type.subhead} numberOfLines={1}>{nameFromEmail(friendEmail)}</Text>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: colors.secondaryMuted,
  },
  requestDetail: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondaryLight,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.section,
    padding: 20,
    gap: 16,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
  },
  list: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 68,
    paddingHorizontal: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: 74,
  },
});
