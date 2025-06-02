import React, { useEffect, useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
    SafeAreaView,
    Dimensions,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation, RouteProp, NavigationProp, StackActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Easing,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../state/ThemeContext';
import { spacing, typography } from '../styles/theme';
import AppBlurView from '../components/atoms/BlurView';
import ArtCard from '../components/organisms/ArtCard';
import AppIcon from '../components/atoms/AppIcon';
import { getSignalById, respondToSignal } from '../api/signals';
import { currentUser } from '../api/auth';
import { RootStackParamList } from '../navigation/AppNavigator';


type SignalDetailScreenRouteProp = RouteProp<RootStackParamList, 'SignalDetailScreen'>;

const SignalDetailScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<SignalDetailScreenRouteProp>();
    const { signalId, sourceMeasurements } = route.params;
    const queryClient = useQueryClient();
    const [remark, setRemark] = useState('');

    // 标记是否正在执行返回动画，防止重复触发
    const isGoingBack = useSharedValue(false);
    const triggerNavigationBack = useSharedValue(false);
    const detailContentOpacity = useSharedValue(1); // 新增：用于控制整体内容透明度
    const cardElevation = useSharedValue(0); // 新增：用于控制卡片elevation

    // 调试日志
    console.log('SignalDetailScreen接收到的参数:', { signalId, sourceMeasurements });

    // 动画控制值
    const animation = useSharedValue(0);
    const contentAnimation = useSharedValue(0);

    // 获取屏幕尺寸
    const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

    // 获取信号详情
    const { data: signal, isLoading, error } = useQuery({
        queryKey: ['signal', signalId],
        queryFn: () => getSignalById(signalId),
    });

    // 启动动画 和 Elevation
    useEffect(() => {
        console.log('动画初始化:', { sourceMeasurements: !!sourceMeasurements, signal: !!signal });
        
        if (sourceMeasurements && signal) {
            animation.value = withTiming(1, {
                duration: 700, 
                easing: Easing.inOut(Easing.cubic), 
            });
            setTimeout(() => {
                contentAnimation.value = withTiming(1, {
                    duration: 400, 
                    easing: Easing.inOut(Easing.cubic), 
                }, () => {
                    // 内容动画完成后显示Elevation
                    runOnJS(setCardElevation)(5); 
                });
            }, 600); 
        } else if (signal) {
            contentAnimation.value = withTiming(1, {
                duration: 200,
                easing: Easing.out(Easing.cubic),
            }, () => {
                 // 内容动画完成后显示Elevation
                runOnJS(setCardElevation)(5);
            });
        }
    }, [sourceMeasurements, signal]);

    const setCardElevation = (value: number) => {
        cardElevation.value = withTiming(value, { duration: 200 });
    };

    // 动画演员的样式
    const animatedActorStyle = useAnimatedStyle(() => {
        if (!sourceMeasurements) {
            return { 
                opacity: 0, 
                pointerEvents: 'none',
                position: 'absolute',
                zIndex: -1,
            };
        }
        
        const currentLeft = interpolate(animation.value, [0, 1], [sourceMeasurements.x, 0]);
        const currentTop = interpolate(animation.value, [0, 1], [sourceMeasurements.y, 0]);
        const currentWidth = interpolate(animation.value, [0, 1], [sourceMeasurements.width, windowWidth]);
        const currentHeight = interpolate(animation.value, [0, 1], [sourceMeasurements.height, windowHeight]);
        const opacityValue = interpolate(animation.value, [0, 0.5, 1], [0, 0.8, 1]);
        
        return {
            position: 'absolute',
            left: currentLeft,
            top: currentTop,
            width: currentWidth,
            height: currentHeight,
            borderRadius: interpolate(animation.value, [0, 1], [16, 0]),
            backgroundColor: colors.background, 
            opacity: opacityValue, 
            zIndex: 1, 
            pointerEvents: 'none', 
            overflow: 'hidden',
        };
    });

    const animatedActorContent = signal ? (
        <ArtCard 
            signal={signal}
            height={undefined} 
            isAnimatedActor={true} 
            isDetailViewActor={false} 
            animationProgress={animation} 
        />
    ) : null;

    // 内容的淡入样式 和 Elevation
    const contentAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(contentAnimation.value, [0, 1], [0, 1]) * detailContentOpacity.value,
            transform: [
                {
                    translateY: interpolate(contentAnimation.value, [0, 1], [30, 0]),
                },
            ],
            zIndex: 2, 
        };
    });

    const animatedInfoCardStyle = useAnimatedStyle(() => {
        return {
            elevation: cardElevation.value,
        };
    });

    // 响应信号的mutation
    const respondMutation = useMutation({
        mutationFn: ({ response, remarkText }: { response: 'accepted' | 'rejected'; remarkText?: string }) =>
            respondToSignal(signalId, response, remarkText),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['signals'] });
            queryClient.invalidateQueries({ queryKey: ['signal', signalId] });
            handleBack(); 
        },
        onError: (err) => {
            Alert.alert('操作失败', err.message || '请稍后重试');
        },
    });

    const handleResponse = (response: 'accepted' | 'rejected') => {
        const actionText = response === 'accepted' ? '同意' : '拒绝';
        // 先将elevation归零
        setCardElevation(0);
        Alert.alert(
            '确认操作',
            `确定要${actionText}这个提议吗？${remark ? `\n备注: ${remark}` : ''}`,
            [
                { text: '取消', style: 'cancel', onPress: () => setCardElevation(5) }, // 取消时恢复Elevation
                {
                    text: actionText,
                    style: response === 'accepted' ? 'default' : 'destructive',
                    onPress: () => respondMutation.mutate({ response, remarkText: remark }),
                },
            ]
        );
    };

    const handleBack = useCallback(() => {
        // 返回前先将Elevation归零
        runOnJS(setCardElevation)(0);

        if (isGoingBack.value) return;
        isGoingBack.value = true;
        
        // 先隐藏内容和细节透明度
        detailContentOpacity.value = withTiming(0, { duration: 150 });
        contentAnimation.value = withTiming(0, {
            duration: 300,
            easing: Easing.inOut(Easing.cubic),
        });

        setTimeout(() => {
            animation.value = withTiming(0, {
                duration: 700,
                easing: Easing.inOut(Easing.cubic),
            }, (finished) => {
                if (finished) {
                    triggerNavigationBack.value = true;
                }
            });
        }, 100);
    }, [isGoingBack, contentAnimation, animation, triggerNavigationBack, detailContentOpacity, setCardElevation]);

    const performJSNavigation = useCallback(() => {
        try {
            navigation.goBack();
        } catch (e) {
            console.error('[performJSNavigation] Error calling navigation.goBack():', e);
            navigation.dispatch(StackActions.pop());
        }
        if (triggerNavigationBack.value) { 
           triggerNavigationBack.value = false; 
        }
    }, [navigation, triggerNavigationBack]);

    useAnimatedReaction(
        () => triggerNavigationBack.value,
        (shouldNavigate, previousValue) => {
            if (shouldNavigate === true && previousValue !== true) { 
                runOnJS(performJSNavigation)();
            }
        },
        [performJSNavigation]
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (isGoingBack.value) return;
            e.preventDefault();
            handleBack();
        });
        return unsubscribe;
    }, [navigation, isGoingBack, handleBack]);

    useEffect(() => {
        return () => {
            isGoingBack.value = false;
        };
    }, [isGoingBack]);

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.centerContent}>
                    <Text style={[styles.loadingText, { color: colors.text }]}>加载中...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !signal) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.centerContent}>
                    <Text style={[styles.errorText, { color: colors.text }]}>
                        加载失败，请稍后重试
                    </Text>
                    <Pressable
                        style={[styles.backButton, { backgroundColor: colors.primary }]}
                        onPress={handleBack}
                    >
                        <Text style={styles.backButtonText}>返回</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const shouldShowResponseButtons =
        signal.status === 'pending' &&
        signal.receiverId === currentUser.id &&
        signal.initiatorId !== currentUser.id;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {sourceMeasurements && (
                <Animated.View style={animatedActorStyle}>
                    {animatedActorContent}
                </Animated.View>
            )}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.header}>
                            <AppBlurView
                                blurType={isDark ? 'dark' : 'light'}
                                blurAmount={25} // 与ArtCard一致的模糊度
                                style={StyleSheet.absoluteFillObject} // 使用absoluteFillObject
                            />
                            <Pressable style={styles.backIconButton} onPress={handleBack}>
                                <AppIcon name="chevron-back" size={28} color={colors.text} />
                            </Pressable>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>详情</Text>
                            <View style={styles.headerSpacer} />
                        </View>

                        <ScrollView
                            style={styles.scrollContainer}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContentContainer}
                        >
                            <View style={styles.detailsContainer}>
                                {signal.users && signal.users.length > 0 && (
                                    <View style={styles.userInfoContainer}>
                                        <View style={styles.avatarSection}>
                                            {signal.users.slice(0, 1).map((user, index) => (
                                                <Image
                                                    key={user.name + index}
                                                    source={{ uri: user.avatarUrl }}
                                                    style={styles.detailAvatar}
                                                />
                                            ))}
                                            {signal.statusIndicatorColor && (
                                                <View style={styles.detailStatusIndicator}>
                                                    <View 
                                                        style={[
                                                            styles.statusDot, 
                                                            { backgroundColor: signal.statusIndicatorColor }
                                                        ]} 
                                                    />
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.userTextContainer}>
                                            <Text style={[styles.userName, { color: colors.text }]}>
                                                {signal.users[0].name}
                                            </Text>
                                            <Text style={[styles.userStatus, { color: colors.textSecondary }]}>
                                                {signal.status === 'pending' ? '等待中' : 
                                                 signal.status === 'accepted' ? '已接受' : 
                                                 signal.status === 'rejected' ? '已拒绝' : '状态未知'}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {signal.title && (
                                    <Animated.Text style={[styles.detailPageTitle, { color: colors.text }]}>
                                        {signal.title}
                                    </Animated.Text>
                                )}

                                <View style={styles.metaInfoContainer}>
                                    {signal.cardCategory && signal.cardCategory.text && (
                                        <View style={styles.categoryBadge}>
                                            <View style={styles.categoryIcon}>
                                                <AppIcon 
                                                    name={signal.cardCategory?.iconName || "radio-outline"} 
                                                    size={14} 
                                                    color={colors.textSecondary}
                                                />
                                            </View>
                                            <Text style={[styles.metaInfoText, { color: colors.textSecondary }]}>
                                                {signal.cardCategory.text} 
                                            </Text>
                                        </View>
                                    )}
                                    {signal.timestamp && (
                                        <View style={styles.timeBadge}>
                                            <View style={styles.timeIcon}>
                                                <AppIcon 
                                                    name="time-outline" 
                                                    size={14} 
                                                    color={colors.textSecondary}
                                                />
                                            </View>
                                            <Text style={[styles.metaInfoText, { color: colors.textSecondary }]}>
                                                {signal.timestamp}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>详细描述</Text>
                                    <Text style={[styles.description, { color: colors.text }]}>
                                        {signal.description}
                                    </Text>
                                </View>

                                <Animated.View style={[styles.infoCard, { backgroundColor: colors.card }, animatedInfoCardStyle]}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>状态信息</Text>
                                    <View style={styles.infoRow}>
                                        <AppIcon name="flag-outline" size={18} color={colors.textSecondary} />
                                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                            状态: {signal.status === 'pending' ? '待响应' : signal.status === 'accepted' ? '已同意' : '已拒绝'}
                                        </Text>
                                    </View>
                                    {signal.type === 'proposal' && signal.options && (
                                        <View style={styles.optionsContainer}>
                                            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.m }]}>选项:</Text>
                                            {signal.options.map((option, index) => (
                                                <View key={index} style={styles.optionRow}>
                                                    <View style={styles.optionBullet}>
                                                        <Text style={styles.bulletText}>{index + 1}</Text>
                                                    </View>
                                                    <Text style={[styles.optionText, { color: colors.textSecondary }]}>
                                                        {option}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </Animated.View>

                                {signal.remark && (
                                    <Animated.View style={[styles.infoCard, { backgroundColor: colors.card, marginTop: spacing.l }, animatedInfoCardStyle]}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>备注</Text>
                                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                                            {signal.remark}
                                        </Text>
                                    </Animated.View>
                                )}
                            </View>

                            {shouldShowResponseButtons && (
                                <View style={styles.responseSectionContainer}>
                                    <Animated.View style={[styles.infoCard, { backgroundColor: colors.card, marginBottom: spacing.m }, animatedInfoCardStyle]}>
                                        <TextInput
                                            style={[styles.remarkInput, { color: colors.text, borderColor: colors.textSecondary }]}
                                            placeholder="添加备注 (可选)"
                                            placeholderTextColor={colors.textSecondary}
                                            value={remark}
                                            onChangeText={setRemark}
                                            multiline
                                        />
                                    </Animated.View>
                                    <View style={styles.responseContainer}>
                                        <Pressable
                                            style={[
                                                styles.responseButton,
                                                styles.acceptButton,
                                                { backgroundColor: colors.primary },
                                            ]}
                                            onPress={() => handleResponse('accepted')}
                                            disabled={respondMutation.isPending}
                                        >
                                            <Text style={[styles.responseButtonText, { color: colors.white }]}>
                                                {respondMutation.isPending ? '处理中...' : '同意'}
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            style={[
                                                styles.responseButton,
                                                styles.rejectButton,
                                                { backgroundColor: 'transparent', borderColor: colors.textSecondary },
                                            ]}
                                            onPress={() => handleResponse('rejected')}
                                            disabled={respondMutation.isPending}
                                        >
                                            <Text style={[styles.responseButtonText, { color: colors.text }]}>
                                                拒绝
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                            <View style={{ height: spacing.xl * 2 }} />
                        </ScrollView>
                    </SafeAreaView>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingBottom: spacing.m,
        marginTop: spacing.l, // 增加顶部边距
        // minHeight: 44,
        position: 'relative',
        // overflow: 'hidden', // 移除以便模糊背景能完全显示
    },
    backIconButton: {
        padding: spacing.s,
        marginRight: spacing.s,
        zIndex: 1, // 确保按钮在模糊背景之上
    },
    headerTitle: {
        ...typography.h1,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        zIndex: 1, // 确保标题在模糊背景之上
    },
    headerSpacer: {
        width: 40, 
        zIndex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: spacing.xl,
    },
    detailsContainer: {
        paddingHorizontal: spacing.m,
        paddingTop: spacing.l,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    avatarSection: {
        position: 'relative',
        marginRight: spacing.m,
    },
    detailAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    detailStatusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    userTextContainer: {
        flex: 1,
    },
    userName: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    userStatus: {
        ...typography.caption,
        fontSize: 14,
    },
    detailPageTitle: {
        ...typography.h1,
        fontWeight: 'bold',
        marginBottom: spacing.m,
        fontSize: 32, 
        letterSpacing: -0.5, 
    },
    metaInfoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: spacing.l,
        gap: spacing.s, 
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
        borderRadius: 15,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
        borderRadius: 15,
    },
    categoryIcon: {
        marginRight: spacing.xs,
    },
    timeIcon: {
        marginRight: spacing.xs,
    },
    metaInfoText: {
        ...typography.caption,
        fontSize: 14,
    },
    infoCard: {
        marginBottom: spacing.l,
        borderRadius: 16,
        padding: spacing.m,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // elevation: 2, // 改为通过animatedInfoCardStyle动态设置
    },
    section: {
        marginBottom: spacing.l,
    },
    sectionTitle: {
        ...typography.h2,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing.m,
    },
    description: {
        ...typography.body,
        lineHeight: 24,
        fontSize: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    infoText: {
        ...typography.body,
        marginLeft: spacing.s,
    },
    optionsContainer: {
        marginTop: spacing.m,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    optionBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.s,
    },
    bulletText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6C7A9C',
    },
    optionText: {
        ...typography.body,
        flex: 1,
    },
    responseSectionContainer: {
        paddingHorizontal: spacing.m,
        paddingTop: spacing.l,
    },
    remarkInput: {
        minHeight: 80,
        padding: spacing.m,
        borderWidth: 1,
        borderRadius: 12,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    responseContainer: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    responseButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.m,
        borderRadius: 16, 
        gap: spacing.s,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    acceptButton: {
    },
    rejectButton: {
        borderWidth: 1,
    },
    responseButtonText: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '600',
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.m,
    },
    loadingText: {
        ...typography.body,
    },
    errorText: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.l,
    },
    backButton: {
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
        borderRadius: 16, 
    },
    backButtonText: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default SignalDetailScreen; 