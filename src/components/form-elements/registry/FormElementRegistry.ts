import { FormElement } from '@/types/form-element';

export class FormElementRegistry {
  private static instance: FormElementRegistry;
  private elements: Map<string, FormElement> = new Map();

  private constructor() {}

  public static getInstance(): FormElementRegistry {
    if (!FormElementRegistry.instance) {
      FormElementRegistry.instance = new FormElementRegistry();
    }
    return FormElementRegistry.instance;
  }

  public register(element: FormElement): void {
    if (this.elements.has(element.type)) {
      console.warn(`Form element with type '${element.type}' is already registered`);
      return;
    }
    this.elements.set(element.type, element);
  }

  public get(type: string): FormElement | undefined {
    return this.elements.get(type);
  }

  public getAll(): FormElement[] {
    return Array.from(this.elements.values());
  }

  public getConfig(type: string) {
    return this.elements.get(type)?.config;
  }

  public getDefaultValue(type: string) {
    const element = this.elements.get(type);
    return element ? element.getDefaultValue() : '';
  }

  public validate(type: string, value: any, field: any): string | undefined {
    const element = this.elements.get(type);
    if (!element || !element.validate) return undefined;
    return element.validate(value, field);
  }

  public transformValue(type: string, value: any): any {
    const element = this.elements.get(type);
    if (!element || !element.transformValue) return value;
    return element.transformValue(value);
  }
}

export const formElementRegistry = FormElementRegistry.getInstance();
