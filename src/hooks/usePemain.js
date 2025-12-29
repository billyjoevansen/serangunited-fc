import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export const usePemain = (id = null) => {
  const [pemain, setPemain] = useState(id ? null : [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPemain = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (id) {
        const { data, error } = await supabase
          . from("pemain_dengan_nilai")
          .select("*")
          .eq("id", id)
          .single()
        
        if (error) throw error
        setPemain(data)
      } else {
        const { data, error } = await supabase
          .from("pemain_dengan_nilai")
          .select("*")
          .order("created_at", { ascending: false })
        
        if (error) throw error
        setPemain(data || [])
      }
    } catch (err) {
      console.error("Error fetching pemain:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPemain = async (pemainData) => {
    try {
      const { data, error } = await supabase
        .from("pemain")
        .insert([pemainData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error:  null }
    } catch (err) {
      console.error("Error creating pemain:", err)
      return { data: null, error: err. message }
    }
  }

  const deletePemain = async (pemainId) => {
    try {
      const { error } = await supabase
        .from("pemain")
        .delete()
        .eq("id", pemainId)
      
      if (error) throw error
      return { error: null }
    } catch (err) {
      console.error("Error deleting pemain:", err)
      return { error: err.message }
    }
  }

  const importPemain = async (pemainDataArray) => {
    const results = { success: 0, failed: 0, errors: [] }
    
    for (let i = 0; i < pemainDataArray.length; i++) {
      const { error } = await supabase
        . from("pemain")
        .insert([pemainDataArray[i]])
      
      if (error) {
        results.failed++
        results.errors.push({
          row: i + 2,
          nama: pemainDataArray[i].nama,
          errors: [error.message]
        })
      } else {
        results.success++
      }
    }
    
    return results
  }

  useEffect(() => {
    fetchPemain()
  }, [id])

  return {
    pemain,
    loading,
    error,
    refetch: fetchPemain,
    createPemain,
    deletePemain,
    importPemain
  }
}

export const usePemainSingle = (id) => {
  const [pemain, setPemain] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPemain = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from("pemain")
        .select("*")
        .eq("id", id)
        .single()
      
      if (error) throw error
      setPemain(data)
    } catch (err) {
      console.error("Error fetching pemain:", err)
      setError(err. message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPemain()
  }, [id])

  return { pemain, loading, error, refetch:  fetchPemain }
}