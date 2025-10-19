"""
Business: Generate social media posts using OpenAI GPT-4 based on topic, platform and tone
Args: event - dict with httpMethod, body containing topic, platform, tone
      context - object with request_id attribute
Returns: HTTP response dict with generated post text
"""
import json
import os
from typing import Dict, Any, Literal

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        topic: str = body_data.get('topic', '')
        platform: str = body_data.get('platform', 'vk')
        tone: str = body_data.get('tone', 'friendly')
        
        if not topic:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Topic is required'})
            }
        
        openai_key = os.environ.get('OPENAI_API_KEY')
        
        if not openai_key:
            templates = {
                'vk': {
                    'professional': f'📊 {topic}\n\nВ современном мире это особенно актуально. Важно учитывать следующие аспекты:\n\n• Системный подход\n• Профессиональное развитие\n• Практическое применение\n\nДелитесь опытом в комментариях! 👇',
                    'friendly': f'Привет! 👋\n\nДавайте поговорим про {topic.lower()}!\n\nЭто реально классная тема, и вот почему:\n✨ Это актуально\n✨ Это интересно\n✨ Это работает\n\nА что думаете вы? Пишите в комментах! 💬',
                    'motivational': f'💪 {topic}\n\nКаждый шаг приближает нас к цели!\n\n🔥 Не останавливайся\n🔥 Верь в себя\n🔥 Действуй сегодня\n\nТвой успех начинается здесь и сейчас! 🚀\n\n#мотивация #успех #развитие',
                },
                'telegram': {
                    'professional': f'<b>{topic}</b>\n\nКлючевые моменты:\n\n▫️ Анализ ситуации\n▫️ Стратегическое планирование\n▫️ Достижение результатов\n\nПодробности в закрепе канала 📌',
                    'friendly': f'{topic} 🎯\n\nДрузья, это важно!\n\n💡 Главная мысль: всё в ваших руках\n💡 Секрет успеха: постоянство\n💡 Результат: гарантирован\n\nСохраняй, чтобы не потерять! ⭐️',
                    'motivational': f'⚡️ <b>{topic}</b>\n\n🎯 Твоя цель - твоя сила!\n🎯 Твои действия - твой результат!\n🎯 Твоё время - СЕЙЧАС!\n\nНе жди понедельника. Начни прямо сейчас! 🔥\n\n#мотивация #цель #действие',
                },
                'instagram': {
                    'professional': f'{topic} ✨\n\nПрофессиональный взгляд на актуальную тему.\n\nОсновные принципы:\n1️⃣ Качество превыше всего\n2️⃣ Постоянное развитие\n3️⃣ Измеримые результаты\n\nСохрани пост, чтобы вернуться позже 🔖\n\n#бизнес #развитие #профессионализм #успех #карьера',
                    'friendly': f'Всем привет! 💕\n\n{topic} - вот о чём хочу поговорить сегодня!\n\nЗнаете, это так важно:\n🌸 Быть собой\n🌸 Делиться опытом\n🌸 Вдохновлять других\n\nА вы как относитесь к этому? 💭\n\n#жизнь #мысли #вдохновение #lifestyle #позитив',
                    'motivational': f'{topic} 🔥\n\nЗАПОМНИ:\n\n💎 Ты сильнее, чем думаешь\n💎 Ты способен на большее\n💎 Твоё время пришло\n\nНе откладывай мечты на завтра! Действуй СЕЙЧАС! ⚡️\n\nОтметь того, кому нужна эта мотивация! 👇\n\n#мотивация #цели #успех #саморазвитие #inspiration',
                },
            }
            
            generated_text = templates.get(platform, {}).get(tone, f'{topic}\n\nГенерация через шаблоны.')
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'text': generated_text,
                    'source': 'template'
                })
            }
        
        try:
            import openai
            
            client = openai.OpenAI(api_key=openai_key)
            
            platform_names = {
                'vk': 'ВКонтакте',
                'telegram': 'Telegram',
                'instagram': 'Instagram'
            }
            
            tone_instructions = {
                'professional': 'профессиональный деловой стиль',
                'friendly': 'дружеский разговорный стиль',
                'motivational': 'мотивационный вдохновляющий стиль'
            }
            
            platform_specs = {
                'vk': 'Используй эмодзи умеренно. Длина 200-400 символов. Призыв к обсуждению в комментариях.',
                'telegram': 'Можешь использовать HTML разметку (<b>, <i>). Длина 150-300 символов. Лаконично и по делу.',
                'instagram': 'Много эмодзи и хэштегов в конце. Длина 300-500 символов. Визуальный и эмоциональный контент.'
            }
            
            prompt = f"""Создай пост для социальной сети {platform_names.get(platform, platform)} на тему "{topic}".

Требования:
- Тон: {tone_instructions.get(tone, tone)}
- {platform_specs.get(platform, '')}
- Текст должен быть на русском языке
- Будь креативным и уникальным
- Используй эмодзи где уместно

Создай готовый к публикации пост:"""

            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Ты профессиональный SMM-специалист, создающий вирусные посты для социальных сетей на русском языке."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.8
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'text': generated_text,
                    'source': 'openai'
                })
            }
            
        except ImportError:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'OpenAI library not installed'})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': f'OpenAI error: {str(e)}'})
            }
            
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invalid JSON'})
        }
