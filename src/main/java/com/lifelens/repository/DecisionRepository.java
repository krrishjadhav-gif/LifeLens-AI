package com.lifelens.repository;

import com.lifelens.entity.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, Long> {

    List<Decision> findAllByOrderByCreatedAtDesc();

}
