
interface MutualFn<T> { (args: T): boolean }
interface UpdateFn { (): void }

export interface API<T> {
  /**
   * Intercept property change callback，Return false to prevent modification 
   * @param {string?} eventName 
   * @param {MutualFn} callback 
   */
  stop<T>(callback: MutualFn<T>): void;
  stop<T>(eventName: string, callback: MutualFn<T>): void;
  
  /**
   * Remove intercepted property change callback
   * @param {string?} eventName 
   * @param {MutualFn} callback 
   */
  removeStop<T>(callback: MutualFn<T>): void;
  removeStop<T>(eventName: string, callback: MutualFn<T>): void;
  
  /**
   * One time interception of property change callback,Return false to prevent modification
   * @param {string?} eventName 
   * @param {MutualFn} callback 
   */
  onceStop<T>(callback: MutualFn<T>): void;
  onceStop<T>(eventName: string, callback: MutualFn<T>): void;
  
  /**
   * Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  update<T>(callback: UpdateFn<T>): void;
  update<T>(eventName: string, callback: UpdateFn<T>): void;

  /**
   * One time Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  onceUpdate<T>(callback: UpdateFn<T>): void;
  onceUpdate<T>(eventName: string, callback: UpdateFn<T>): void;
  
  /**
   * remove Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  removeUpdate<T>(callback: UpdateFn<T>): void;
  removeUpdate<T>(eventName: string, callback: UpdateFn<T>): void;

  
  /**
   * remove Triggered when the property change is successful
   * @param {string?} eventName 
   * @param {function} callback 
   */
  nextTick<T>(callback: UpdateFn<T>): void;
  nextTick<T>(eventName: string, callback: UpdateFn<T>): void;

  // Get the original proxy without attached API
  origin: T,
  // Get the data before modification, which cannot be modified
  old: T,
  
  destroy(): void;
}

export type Interact<T> = T &  { api: API<T> };
export default function exports<T = {}>( options: T ): Interact<T>;