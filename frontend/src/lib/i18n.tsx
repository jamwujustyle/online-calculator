import React, { createContext, useContext, useState } from 'react';

export type Lang = 'en' | 'ru';

const translations = {
    en: {
        // Dashboard
        dashboard_title: 'My Projects',
        new_project: 'New Project',
        no_projects: 'No projects yet',
        no_projects_desc: 'Create your first project to start calculating costs.',
        logout: 'Logout',
        delete: 'Delete',
        cancel: 'Cancel',
        delete_project: 'Delete Project',
        delete_confirm: 'This will permanently delete this project and all its data. This action cannot be undone.',

        // Create modal
        create_project: 'Create Project',
        creating: 'Creating...',
        project_title: 'Project Title',
        client_name: 'Client Name',
        contact: 'Contact',
        notes: 'Notes',

        // Editor
        upload_model: 'Upload Model',
        view_notes: 'View notes',
        production_setup: 'Production Setup',
        material_tech: 'Material & Tech',
        technology: 'Technology',
        material: 'Material',
        density: 'Density (g/cm³)',
        price_kg: 'Price/kg',
        waste: 'Waste Refuse (%)',
        print_settings: 'Print Settings',
        infill: 'Infill (%)',
        supports: 'Supports (%)',
        print_time: 'Print Time (Hrs)',
        post_proc: 'Post-proc (Hrs)',
        model_prep: 'Modeling Prep (Mins)',
        economics: 'Economics',
        markup: 'Markup (%)',
        defect_risk: 'Defect Risk (%)',
        batch_qty: 'Batch Qty',
        tax: 'Tax (%)',
        amortization: 'Amortization ($/hr)',
        electricity: 'Electricity ($/hr)',
        currency: 'Currency',

        // Results
        cost_breakdown: 'Cost Breakdown',
        material_cost: 'Material Cost',
        operations_power: 'Operations & Power',
        labor_prep: 'Labor & Prep',
        unit_selling: 'Unit Selling Price',
        profit_unit: 'Profit / unit',
        batch_total: 'Batch Total',
        generate_ai: 'Generate AI Descriptions',
        generating: 'Generating Descriptions...',
        tech_description: 'Technical Description',
        commercial_pitch: 'Commercial Pitch',
        upload_to_calc: 'Upload a model and wait for processing to see calculations.',

        // Viewer
        model_specs: 'Model Specs',
        processing: 'Analyzing 3D geometry...',
        no_model: 'No 3D model uploaded yet',
        failed_model: 'Failed to process model',
        viewer_hint: 'Left Click: Rotate | Right Click: Pan',
    },
    ru: {
        // Dashboard
        dashboard_title: 'Мои проекты',
        new_project: 'Новый проект',
        no_projects: 'Проектов пока нет',
        no_projects_desc: 'Создайте первый проект для начала расчётов.',
        logout: 'Выйти',
        delete: 'Удалить',
        cancel: 'Отмена',
        delete_project: 'Удалить проект',
        delete_confirm: 'Это навсегда удалит этот проект и все его данные. Это действие нельзя отменить.',

        // Create modal
        create_project: 'Создать проект',
        creating: 'Создаётся...',
        project_title: 'Название проекта',
        client_name: 'Имя клиента',
        contact: 'Контакт',
        notes: 'Заметки',

        // Editor
        upload_model: 'Загрузить модель',
        view_notes: 'Заметки',
        production_setup: 'Параметры производства',
        material_tech: 'Материал и технология',
        technology: 'Технология',
        material: 'Материал',
        density: 'Плотность (г/см³)',
        price_kg: 'Цена/кг',
        waste: 'Отходы (%)',
        print_settings: 'Настройки печати',
        infill: 'Заполнение (%)',
        supports: 'Поддержки (%)',
        print_time: 'Время печати (Ч)',
        post_proc: 'Постобработка (Ч)',
        model_prep: 'Моделирование (Мин)',
        economics: 'Экономика',
        markup: 'Наценка (%)',
        defect_risk: 'Брак (%)',
        batch_qty: 'Кол-во деталей',
        tax: 'Налог (%)',
        amortization: 'Амортизация ($/ч)',
        electricity: 'Электричество ($/ч)',
        currency: 'Валюта',

        // Results
        cost_breakdown: 'Разбор стоимости',
        material_cost: 'Стоимость материала',
        operations_power: 'Операции и энергия',
        labor_prep: 'Работа и подготовка',
        unit_selling: 'Цена за единицу',
        profit_unit: 'Прибыль / шт',
        batch_total: 'Итого за партию',
        generate_ai: 'Генерировать AI описание',
        generating: 'Генерация описания...',
        tech_description: 'Техническое описание',
        commercial_pitch: 'Коммерческий текст',
        upload_to_calc: 'Загрузите модель и дождитесь обработки для расчётов.',

        // Viewer
        model_specs: 'Параметры модели',
        processing: 'Анализ 3D-геометрии...',
        no_model: '3D-модель ещё не загружена',
        failed_model: 'Ошибка обработки модели',
        viewer_hint: 'ЛКМ: Вращение | ПКМ: Перемещение',
    },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
    lang: 'en',
    setLang: () => { },
    t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Lang>(() => {
        return (localStorage.getItem('app-lang') as Lang) || 'en';
    });

    const changeLang = (newLang: Lang) => {
        setLang(newLang);
        localStorage.setItem('app-lang', newLang);
    };

    const t = (key: TranslationKey): string => {
        return translations[lang][key] || translations.en[key] || key;
    };

    return (
        <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => useContext(I18nContext);
