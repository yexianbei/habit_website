import React from 'react'
import { 
  Target, 
  Brain, 
  Timer, 
  Ban, 
  Sprout, 
  Cloud 
} from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

const iconMap = [Target, Brain, Timer, Ban, Sprout, Cloud]
const colorMap = [
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-green-100 text-green-600',
  'bg-red-100 text-red-600',
  'bg-yellow-100 text-yellow-600',
  'bg-indigo-100 text-indigo-600'
]

const Features = () => {
  const { tArray, t } = useLanguage()
  const features = tArray('features.items').map((item, index) => ({
    ...item,
    icon: iconMap[index],
    color: colorMap[index]
  }))

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="section-title">{t('features.title')}</h2>
          <p className="section-subtitle">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features

