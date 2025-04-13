import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
require('dotenv').config()

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Initialize Supabase client with environment variables
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  // Aggregator table methods
  async findAggregators(query = {}): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('aggregators')
      .select('*')
      .match(query);

    if (error) throw error;
    return data || [];
  }

  async findAggregatorsByOwner(owner: string): Promise<any[]> {
    return this.findAggregators({ owner });
  }

  async createAggregator(aggregator: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('aggregators')
      .insert(aggregator)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAggregator(id: string, updates: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('aggregators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
