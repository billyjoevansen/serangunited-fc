import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { PENILAIAN_FIELDS } from "@/utils/calculations"

export const usePenilaian = (pemainId) => {
  const [penilaianList, setPenilaianList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPenilaian = async () => {
    if (!pemainId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        . from("penilaian")
        .select("*")
        .eq("pemain_id", pemainId)
        .order("created_at", { ascending:  false })
      
      if (error) throw error
      setPenilaianList(data || [])
    } catch (err) {
      console.error("Error fetching penilaian:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPenilaian = async (penilaianData) => {
    try {
      const { data, error } = await supabase
        .from("penilaian")
        .insert([{ pemain_id: pemainId, ...penilaianData }])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console. error("Error creating penilaian:", err)
      return { data: null, error: err.message }
    }
  }

  const deletePenilaian = async (penilaianId) => {
    try {
      const { error } = await supabase
        .from("penilaian")
        .delete()
        .eq("id", penilaianId)
      
      if (error) throw error
      await fetchPenilaian()
      return { error: null }
    } catch (err) {
      console.error("Error deleting penilaian:", err)
      return { error: err.message }
    }
  }

  useEffect(() => {
    fetchPenilaian()
  }, [pemainId])

  return {
    penilaianList,
    loading,
    error,
    refetch:  fetchPenilaian,
    createPenilaian,
    deletePenilaian
  }
}

export const usePenilaianForm = () => {
  const initialState = {
    penilai_nama: "",
    teknik_dasar: 50,
    keterampilan_spesifik: 50,
    keseimbangan:  50,
    daya_tahan: 50,
    kecepatan_kelincahan: 50,
    postur: 50,
    reading_game: 50,
    decision_making: 50,
    adaptasi: 50,
    mentalitas: 50,
    disiplin: 50,
    team_player: 50,
    rekam_jejak: 50,
    catatan: "",
  }

  const [penilaian, setPenilaian] = useState(initialState)

  const handleChange = (e) => {
    const { name, value } = e.target
    setPenilaian(prev => ({
      ...prev,
      [name]:  name === "penilai_nama" || name === "catatan" ? value :  parseInt(value)
    }))
  }

  const resetForm = () => {
    setPenilaian(initialState)
  }

  const calculateAverage = () => {
    const total = PENILAIAN_FIELDS.reduce((sum, field) => sum + penilaian[field], 0)
    return (total / PENILAIAN_FIELDS.length).toFixed(1)
  }

  const calculateCategoryAverage = (fields) => {
    const total = fields.reduce((sum, field) => sum + penilaian[field], 0)
    return (total / fields. length).toFixed(1)
  }

  return {
    penilaian,
    setPenilaian,
    handleChange,
    resetForm,
    calculateAverage,
    calculateCategoryAverage
  }
}