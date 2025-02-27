import { useState, useCallback, useEffect } from 'react';
import { Note } from '../types/Note';
import { supabase } from '../lib/supabase';
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  const loadNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setNotes(data);
        console.log('Loaded notes:', data);
      } else {
        console.log('No notes found');
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNotes = async (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
  };

  const addNote = async (newNote: Omit<Note, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select();

      if (error) throw error;

      if (data) {
        const updatedNotes = [...notes, data[0]];
        setNotes(updatedNotes);
        console.log('Added note:', data[0]);
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const updateNote = async (id: string, updatedNote: Partial<Omit<Note, 'id'>>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updatedNote)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data) {
        const updatedNotes = notes.map(note => 
          note.id === id ? { ...note, ...data[0] } : note
        );
        setNotes(updatedNotes);
        console.log('Updated note:', data[0]);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      console.log('Deleted note with id:', id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const getNoteById = useCallback((id: string) => {
    console.log('Searching for note with id:', id);
    console.log('Current notes:', notes);
    const note = notes.find(note => note.id === id);
    if (!note) {
      console.warn(`Note with id ${id} not found`);
    } else {
      console.log('Found note:', note);
    }
    return note;
  }, [notes]);

  return { notes, loadNotes, addNote, updateNote, deleteNote, getNoteById };
}