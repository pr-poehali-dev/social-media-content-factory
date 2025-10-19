import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface GeneratedPost {
  id: string;
  platform: string;
  topic: string;
  text: string;
  timestamp: number;
  scheduledDate?: string;
}

interface ScheduledPost extends GeneratedPost {
  scheduledDate: string;
}

const Index = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<'telegram' | 'instagram' | 'threads' | 'youtube'>('telegram');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'motivational'>('friendly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'generator' | 'calendar'>('generator');
  const { toast } = useToast();

  const generatePost = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите тему поста',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('https://functions.poehali.dev/e9f020cf-968a-4ca0-b0a2-074d9d28495d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          platform,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      const newPost: GeneratedPost = {
        id: Date.now().toString(),
        platform,
        topic,
        text: data.text,
        timestamp: Date.now(),
      };

      setGeneratedPosts([newPost, ...generatedPosts]);
      
      toast({
        title: 'Пост создан!',
        description: data.source === 'openai' 
          ? 'Уникальный пост сгенерирован через OpenAI GPT-4' 
          : 'Пост создан по шаблону',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сгенерировать пост',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано!',
      description: 'Текст поста скопирован в буфер обмена',
    });
  };

  const deletePost = (id: string) => {
    setGeneratedPosts(generatedPosts.filter(post => post.id !== id));
    toast({
      title: 'Удалено',
      description: 'Пост удалён из библиотеки',
    });
  };

  const updatePostText = (id: string, newText: string) => {
    setGeneratedPosts(generatedPosts.map(post => 
      post.id === id ? { ...post, text: newText } : post
    ));
    setEditingId(null);
    toast({
      title: 'Сохранено',
      description: 'Изменения сохранены',
    });
  };

  const schedulePost = (post: GeneratedPost, date: string) => {
    const scheduled: ScheduledPost = {
      ...post,
      scheduledDate: date,
    };
    setScheduledPosts([...scheduledPosts, scheduled]);
    toast({
      title: 'Запланировано!',
      description: `Пост запланирован на ${new Date(date).toLocaleDateString('ru-RU')}`,
    });
  };

  const removeScheduledPost = (id: string) => {
    setScheduledPosts(scheduledPosts.filter(p => p.id !== id));
    toast({
      title: 'Удалено',
      description: 'Пост удалён из календаря',
    });
  };

  const getPlatformIcon = (platformName: string) => {
    const icons = {
      telegram: 'Send',
      instagram: 'Camera',
      threads: 'AtSign',
      youtube: 'Video',
    };
    return icons[platformName as keyof typeof icons] || 'FileText';
  };

  const getPlatformColor = (platformName: string) => {
    const colors = {
      telegram: 'bg-sky-500',
      instagram: 'bg-pink-500',
      threads: 'bg-purple-500',
      youtube: 'bg-red-500',
    };
    return colors[platformName as keyof typeof colors] || 'bg-gray-500';
  };

  const getMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getPostsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledPosts.filter(p => p.scheduledDate === dateStr);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Контент-Фабрика
            </h1>
            <p className="text-gray-600 text-lg">Генерация постов для социальных сетей с помощью ИИ</p>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant={currentView === 'generator' ? 'default' : 'outline'}
              onClick={() => setCurrentView('generator')}
              className={currentView === 'generator' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
            >
              <Icon name="Sparkles" size={18} className="mr-2" />
              Генератор
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'default' : 'outline'}
              onClick={() => setCurrentView('calendar')}
              className={currentView === 'calendar' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
            >
              <Icon name="Calendar" size={18} className="mr-2" />
              Календарь ({scheduledPosts.length})
            </Button>
          </div>
        </header>

        {currentView === 'generator' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6 shadow-lg animate-scale-in">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Icon name="Sparkles" size={24} className="text-purple-600" />
                Генератор постов
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Тема поста</label>
                  <Input
                    placeholder="Например: продуктивность, здоровый образ жизни..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Социальная сеть</label>
                  <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telegram">
                        <div className="flex items-center gap-2">
                          <Icon name="Send" size={16} />
                          Telegram
                        </div>
                      </SelectItem>
                      <SelectItem value="instagram">
                        <div className="flex items-center gap-2">
                          <Icon name="Camera" size={16} />
                          Instagram
                        </div>
                      </SelectItem>
                      <SelectItem value="threads">
                        <div className="flex items-center gap-2">
                          <Icon name="AtSign" size={16} />
                          Threads
                        </div>
                      </SelectItem>
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <Icon name="Video" size={16} />
                          YouTube
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Тон общения</label>
                  <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">
                        <div className="flex items-center gap-2">
                          <Icon name="Briefcase" size={16} />
                          Профессиональный
                        </div>
                      </SelectItem>
                      <SelectItem value="friendly">
                        <div className="flex items-center gap-2">
                          <Icon name="Heart" size={16} />
                          Дружеский
                        </div>
                      </SelectItem>
                      <SelectItem value="motivational">
                        <div className="flex items-center gap-2">
                          <Icon name="Zap" size={16} />
                          Мотивационный
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generatePost}
                  disabled={isGenerating}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isGenerating ? (
                    <>
                      <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                      Генерирую...
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" size={20} className="mr-2" />
                      Создать пост
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Icon name="Info" size={20} className="text-purple-600" />
                Как это работает
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">1</div>
                  <p>Введите тему поста, о которой хотите рассказать</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">2</div>
                  <p>Выберите социальную сеть и тон общения</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">3</div>
                  <p>Получите готовый пост, адаптированный под платформу</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">4</div>
                  <p>Редактируйте, копируйте и публикуйте!</p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 shadow-lg h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Icon name="Library" size={24} className="text-purple-600" />
                  Библиотека постов
                </h2>
                <Badge variant="secondary" className="text-sm">
                  {generatedPosts.length} {generatedPosts.length === 1 ? 'пост' : 'постов'}
                </Badge>
              </div>

              {generatedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Icon name="FileText" size={64} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Пока нет постов</p>
                  <p className="text-gray-400 text-sm">Создайте первый пост с помощью генератора</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                  {generatedPosts.map((post, index) => (
                    <Card key={post.id} className="p-4 border-l-4 hover:shadow-md transition-shadow animate-fade-in" style={{ borderLeftColor: getPlatformColor(post.platform).replace('bg-', '#') }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${getPlatformColor(post.platform)} flex items-center justify-center text-white`}>
                            <Icon name={getPlatformIcon(post.platform)} size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm capitalize">{post.platform}</p>
                            <p className="text-xs text-gray-500">{post.topic}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {editingId === post.id ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const textarea = document.getElementById(`post-${post.id}`) as HTMLTextAreaElement;
                                if (textarea) updatePostText(post.id, textarea.value);
                              }}
                            >
                              <Icon name="Check" size={16} />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(post.id)}
                            >
                              <Icon name="Edit" size={16} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(post.text)}
                          >
                            <Icon name="Copy" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const dateInput = prompt('Введите дату публикации (ГГГГ-ММ-ДД):');
                              if (dateInput) {
                                schedulePost(post, dateInput);
                              }
                            }}
                          >
                            <Icon name="Calendar" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePost(post.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>

                      {editingId === post.id ? (
                        <Textarea
                          id={`post-${post.id}`}
                          defaultValue={post.text}
                          className="min-h-[150px] font-normal"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.text}</p>
                      )}

                      <div className="mt-3 text-xs text-gray-400">
                        {new Date(post.timestamp).toLocaleString('ru-RU')}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
        )}

        {currentView === 'calendar' && (
          <div className="space-y-6">
            <Card className="p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Icon name="CalendarDays" size={24} className="text-purple-600" />
                  Календарь публикаций
                </h2>
                <Badge variant="secondary">
                  {scheduledPosts.length} запланировано
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[0, 1, 2].map((monthOffset) => {
                  const currentDate = new Date();
                  const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
                  const year = targetMonth.getFullYear();
                  const month = targetMonth.getMonth();
                  const { daysInMonth, startingDayOfWeek } = getMonthDays(year, month);
                  
                  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

                  return (
                    <Card key={monthOffset} className="p-4">
                      <h3 className="text-lg font-semibold mb-4 text-center">
                        {monthNames[month]} {year}
                      </h3>
                      
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(day => (
                          <div key={day} className="text-center text-xs font-semibold text-gray-500 p-1">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }).map((_, i) => (
                          <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        
                        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                          const day = dayIndex + 1;
                          const date = new Date(year, month, day);
                          const postsForDay = getPostsForDate(date);
                          const isToday = date.toDateString() === new Date().toDateString();
                          
                          return (
                            <div
                              key={day}
                              className={`aspect-square border rounded-lg p-1 flex flex-col items-center justify-center text-sm cursor-pointer transition-all hover:shadow-md ${
                                isToday ? 'bg-purple-100 border-purple-600 font-bold' : 'hover:bg-gray-50'
                              } ${postsForDay.length > 0 ? 'bg-purple-50' : ''}`}
                              onClick={() => {
                                if (generatedPosts.length > 0) {
                                  const dateStr = date.toISOString().split('T')[0];
                                  const selectedPost = generatedPosts[0];
                                  schedulePost(selectedPost, dateStr);
                                }
                              }}
                            >
                              <span className={isToday ? 'text-purple-600' : ''}>{day}</span>
                              {postsForDay.length > 0 && (
                                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                                  {postsForDay.slice(0, 3).map((post, i) => (
                                    <div
                                      key={i}
                                      className={`w-1.5 h-1.5 rounded-full ${getPlatformColor(post.platform)}`}
                                      title={post.platform}
                                    />
                                  ))}
                                  {postsForDay.length > 3 && (
                                    <span className="text-[8px] text-gray-500">+{postsForDay.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Icon name="List" size={20} className="text-purple-600" />
                Запланированные посты
              </h3>

              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="CalendarX" size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Нет запланированных постов</p>
                  <p className="text-sm text-gray-400 mt-1">Создайте пост и добавьте его в календарь</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledPosts
                    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                    .map((post) => (
                      <Card key={post.id} className="p-4 border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: getPlatformColor(post.platform).replace('bg-', '#') }}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-lg ${getPlatformColor(post.platform)} flex items-center justify-center text-white flex-shrink-0`}>
                              <Icon name={getPlatformIcon(post.platform)} size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold capitalize">{post.platform}</p>
                                <Badge variant="outline" className="text-xs">
                                  {new Date(post.scheduledDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 line-clamp-2">{post.text}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeScheduledPost(post.id)}
                          >
                            <Icon name="X" size={16} />
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;